import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Download, Loader2, RefreshCw, X, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface MessageAttachmentProps {
    fileUrl: string;
    fileType: string;
    fileName?: string;
}

export const MessageAttachment: React.FC<MessageAttachmentProps> = ({ fileUrl, fileType, fileName }) => {
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const getSignedUrl = useCallback(async () => {
        try {
            setLoading(true);
            setError(false);

            const bucketMatch = fileUrl.split('/documents/');
            if (bucketMatch.length < 2) {
                setSignedUrl(fileUrl);
                setLoading(false);
                return;
            }

            const filePath = bucketMatch[1];

            // URL holen (1 Stunde gültig)
            const { data, error } = await supabase.storage
                .from('documents')
                .createSignedUrl(filePath, 3600);

            if (error || !data?.signedUrl) {
                console.error('Error signing URL:', error);
                setError(true);
            } else {
                setSignedUrl(data.signedUrl);
            }
        } catch (err) {
            console.error('Failed to generate signed URL', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [fileUrl]);

    useEffect(() => {
        getSignedUrl();
    }, [getSignedUrl, refreshKey]);

    const handleRefresh = (e: React.MouseEvent) => {
        e.stopPropagation();
        setRefreshKey(prev => prev + 1);
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!signedUrl) return;

        try {
            const response = await fetch(signedUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download error:', error);
            // Fallback to opening in new tab
            window.open(signedUrl, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg max-w-[200px]">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Loading...</span>
            </div>
        );
    }

    if (error || !signedUrl) {
        return (
            <div className="flex items-center space-x-2 p-3 bg-error/10 text-error rounded-lg cursor-pointer" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4" />
                <span className="text-xs">Preview expired. Reload.</span>
            </div>
        );
    }

    // Helper function to check if it's an image
    const isImage = fileType?.startsWith('image/') || fileType === 'image';
    const isPDF = fileType === 'application/pdf' || fileType === 'pdf';

    // --- BILDER (mit Modal & Download) ---
    if (isImage) {
        return (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <div className="relative group max-w-sm rounded-lg overflow-hidden border border-border cursor-pointer">
                        {/* Das Bild direkt im Chat */}
                        <img
                            src={signedUrl}
                            alt={fileName || 'Attachment'}
                            className="w-full h-auto max-h-64 object-cover"
                            onError={() => refreshKey < 3 && setRefreshKey(prev => prev + 1)}
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Maximize2 className="w-8 h-8 text-white drop-shadow-md" />
                        </div>
                    </div>
                </DialogTrigger>

                {/* Modal für Großansicht */}
                <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none shadow-none overflow-hidden flex flex-col items-center justify-center h-[90vh]">
                    <div className="relative w-full h-full flex items-center justify-center" onClick={() => setIsDialogOpen(false)}>
                        {/* Großes Bild */}
                        <img
                            src={signedUrl}
                            alt={fileName}
                            className="max-w-full max-h-full object-contain rounded-md shadow-2xl bg-black/50"
                            onClick={(e) => e.stopPropagation()} // Verhindert Schließen beim Klick aufs Bild
                        />

                        {/* Buttons oben rechts */}
                        <div className="absolute top-4 right-4 flex gap-2 z-50">
                            <Button
                                size="icon"
                                className="bg-black/50 hover:bg-black/70 text-white rounded-full border border-white/20"
                                onClick={handleDownload}
                                title="Download Image"
                            >
                                <Download className="w-5 h-5" />
                            </Button>
                            <Button
                                size="icon"
                                className="bg-black/50 hover:bg-black/70 text-white rounded-full border border-white/20"
                                onClick={(e) => { e.stopPropagation(); setIsDialogOpen(false); }}
                                title="Close Preview"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // --- PDF ---
    if (isPDF) {
        return (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <div className="max-w-sm w-full">
                        <div className="flex items-center justify-between p-3 bg-muted/50 hover:bg-muted rounded-lg border border-border transition-colors group cursor-pointer">
                            <div className="flex items-center space-x-3 overflow-hidden" onClick={() => setIsDialogOpen(true)}>
                                <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-4 h-4 text-error" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{fileName || 'Document.pdf'}</p>
                                    <p className="text-xs text-muted-foreground">Click to preview</p>
                                </div>
                            </div>
                            <button
                                onClick={handleDownload}
                                className="p-2 hover:bg-muted rounded-full transition-colors"
                                title="Download PDF"
                            >
                                <Download className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                            </button>
                        </div>
                    </div>
                </DialogTrigger>

                {/* PDF Preview Dialog */}
                <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-white">
                    <div className="relative w-full h-full flex flex-col">
                        {/* Header with filename and buttons */}
                        <div className="p-4 border-b border-border flex items-center justify-between bg-card shrink-0">
                            <h3 className="text-sm font-semibold text-foreground truncate pr-4">
                                {fileName || 'Document.pdf'}
                            </h3>
                            <div className="flex gap-2">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={handleDownload}
                                    title="Download PDF"
                                >
                                    <Download className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={(e) => { e.stopPropagation(); setIsDialogOpen(false); }}
                                    title="Close Preview"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        {/* PDF iframe */}
                        <div className="flex-1 overflow-hidden">
                            <iframe
                                src={signedUrl}
                                className="w-full h-full"
                                title={fileName || "PDF Preview"}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // --- ANDERE DATEIEN ---
    return (
        <button
            onClick={handleDownload}
            className="flex items-center p-3 bg-muted/50 hover:bg-muted rounded-lg border border-border transition-colors max-w-sm w-full cursor-pointer"
        >
            <FileText className="w-5 h-5 mr-3 text-primary" />
            <span className="text-sm font-medium truncate flex-1">{fileName || 'Attachment'}</span>
            <Download className="w-4 h-4 text-muted-foreground ml-2" />
        </button>
    );
};