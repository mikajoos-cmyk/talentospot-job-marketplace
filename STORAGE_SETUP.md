# Storage Bucket Setup für CV Upload

## Problem
Der CV-Upload schlägt fehl mit einem Row-Level Security (RLS) Policy-Fehler, weil die Storage Buckets und Policies nicht korrekt konfiguriert sind.

## Lösung

### Option 1: Über Supabase Dashboard (Empfohlen)

1. **Gehen Sie zu Ihrem Supabase Dashboard**: https://app.supabase.com
2. **Wählen Sie Ihr Projekt aus**
3. **Navigieren Sie zu "Storage"** im linken Menü
4. **Erstellen Sie die Buckets** (falls nicht vorhanden):
   - Klicken Sie auf "New bucket"
   - Name: `cvs`, Public: ✓ (aktiviert)
   - Name: `portfolios`, Public: ✓ (aktiviert)  
   - Name: `documents`, Public: ✓ (aktiviert)

5. **Konfigurieren Sie die Policies** für jeden Bucket:
   
   Gehen Sie zu **Storage** → **Policies** → Wählen Sie den Bucket aus → **New Policy**

   **Für CVs Bucket:**
   - **INSERT Policy**: "Users can upload their own CVs"
     ```sql
     (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text)
     ```
   
   - **SELECT Policy**: "CVs are publicly accessible"
     ```sql
     bucket_id = 'cvs'
     ```
   
   - **UPDATE Policy**: "Users can update their own CVs"
     ```sql
     (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text)
     ```
   
   - **DELETE Policy**: "Users can delete their own CVs"
     ```sql
     (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text)
     ```

   **Wiederholen Sie dies für `portfolios` und `documents` Buckets** (ersetzen Sie 'cvs' durch den jeweiligen Bucket-Namen)

### Option 2: Via SQL Editor

1. Gehen Sie zu **SQL Editor** im Supabase Dashboard
2. Führen Sie die Migration aus: `supabase/migrations/20260202000000_create_storage_buckets_and_policies.sql`

### Option 3: Lokale Supabase CLI

Wenn Sie Supabase lokal laufen haben:
```bash
supabase db reset
```

## Testen

Nach der Konfiguration:
1. Navigieren Sie zu `/candidate/profile/edit`
2. Laden Sie eine CV-Datei hoch
3. Der Upload sollte jetzt funktionieren

## Hinweis

Die Migration-Datei wurde bereits erstellt unter:
`supabase/migrations/20260202000000_create_storage_buckets_and_policies.sql`

Diese wird automatisch angewendet, wenn Sie das nächste Mal `supabase db reset` ausführen oder die Migrationen manuell anwenden.
