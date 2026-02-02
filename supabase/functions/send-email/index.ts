// Follow this setup guide to integrate the Deno runtime into your project:
// https://deno.land/manual/getting_started/setup_your_environment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
    type: 'application-accepted' | 'application-rejected'
    to: string
    candidateName: string
    jobTitle: string
    companyName: string
    jobLocation: string
    salary?: string
    employerContact?: string
    applicationUrl?: string
    jobSearchUrl?: string
}

function renderTemplate(template: string, data: Record<string, any>): string {
    let rendered = template

    // Replace simple variables {{variable}}
    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, 'g')
        rendered = rendered.replace(regex, value || '')
    }

    // Handle conditional blocks {{#if variable}}...{{/if}}
    rendered = rendered.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, variable, content) => {
        return data[variable] ? content : ''
    })

    return rendered
}

async function loadTemplate(templateName: string): Promise<string> {
    const templatePath = `./templates/${templateName}.html`
    try {
        const template = await Deno.readTextFile(templatePath)
        return template
    } catch (error) {
        console.error(`Error loading template ${templateName}:`, error)
        throw new Error(`Template ${templateName} not found`)
    }
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const emailRequest: EmailRequest = await req.json()

        if (!RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not set')
        }

        // Load the appropriate template
        const templateName = emailRequest.type === 'application-accepted'
            ? 'application-accepted'
            : 'application-rejected'

        const template = await loadTemplate(templateName)

        // Render the template with data
        const htmlContent = renderTemplate(template, {
            candidateName: emailRequest.candidateName,
            jobTitle: emailRequest.jobTitle,
            companyName: emailRequest.companyName,
            jobLocation: emailRequest.jobLocation,
            salary: emailRequest.salary,
            employerContact: emailRequest.employerContact,
            applicationUrl: emailRequest.applicationUrl || 'https://talentospot.com/candidate/applications',
            jobSearchUrl: emailRequest.jobSearchUrl || 'https://talentospot.com/jobs',
        })

        // Send email via Resend
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'TalentoSpot <noreply@talentospot.com>',
                to: [emailRequest.to],
                subject: emailRequest.type === 'application-accepted'
                    ? `🎉 Ihre Bewerbung wurde akzeptiert - ${emailRequest.jobTitle}`
                    : `Bewerbungsstatus Update - ${emailRequest.jobTitle}`,
                html: htmlContent,
            }),
        })

        if (!res.ok) {
            const error = await res.text()
            console.error('Resend API error:', error)
            throw new Error(`Failed to send email: ${error}`)
        }

        const data = await res.json()

        return new Response(
            JSON.stringify({ success: true, messageId: data.id }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error) {
        console.error('Error in send-email function:', error)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-email' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"type":"application-accepted","to":"candidate@example.com","candidateName":"John Doe","jobTitle":"Software Engineer","companyName":"Tech Corp","jobLocation":"Berlin, Germany"}'

*/
