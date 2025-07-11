import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadCaptureRequest {
  email: string;
  language: 'en' | 'lt';
  source: string;
  marketingConsent: boolean;
  firstName?: string;
  lastName?: string;
  company?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 HubSpot Lead Capture - Function started');

    const { email, language, source, marketingConsent, firstName, lastName, company }: LeadCaptureRequest = await req.json();

    // Validate required fields
    if (!email || !language || !source || marketingConsent !== true) {
      console.error('❌ Missing required fields:', { email: !!email, language, source, marketingConsent });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          details: 'Email, language, source, and marketing consent are required'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get HubSpot API key from Deno environment
    const hubspotApiKey = Deno.env.get('HUBSPOT_API_KEY');
    if (!hubspotApiKey) {
      console.error('❌ HubSpot API key not configured');
      return new Response(
        JSON.stringify({ error: 'HubSpot integration not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('📝 Creating HubSpot contact for:', email);

    // Prepare contact data for HubSpot
    const contactData = {
      properties: {
        email: email,
        firstname: firstName || '',
        lastname: lastName || '',
        company: company || '',
        // Custom properties
        demo_language_preference: language,
        lead_source: source,
        marketing_consent: marketingConsent ? 'Yes' : 'No',
        demo_video_accessed: 'Yes',
        demo_access_date: new Date().toISOString(),
        // Lifecycle stage
        lifecyclestage: 'lead',
        // Lead status
        hs_lead_status: 'NEW'
      }
    };

    // Create or update contact in HubSpot
    const hubspotResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    const hubspotResult = await hubspotResponse.json();

    if (!hubspotResponse.ok) {
      // If contact already exists, try to update it
      if (hubspotResult.category === 'CONFLICT') {
        console.log('🔄 Contact exists, attempting to update...');
        
        // Search for existing contact by email
        const searchResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hubspotApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filterGroups: [{
              filters: [{
                propertyName: 'email',
                operator: 'EQ',
                value: email
              }]
            }]
          }),
        });

        const searchResult = await searchResponse.json();
        
        if (searchResult.results && searchResult.results.length > 0) {
          const contactId = searchResult.results[0].id;
          console.log('📝 Updating existing contact:', contactId);

          // Update existing contact
          const updateResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${hubspotApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData),
          });

          if (updateResponse.ok) {
            const updateResult = await updateResponse.json();
            console.log('✅ Contact updated successfully:', updateResult.id);
            
            return new Response(
              JSON.stringify({ 
                success: true, 
                contactId: updateResult.id,
                action: 'updated'
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } else {
            const updateError = await updateResponse.json();
            console.error('❌ Failed to update contact:', updateError);
            throw new Error(`Failed to update contact: ${updateError.message}`);
          }
        }
      } else {
        console.error('❌ HubSpot API error:', hubspotResult);
        throw new Error(`HubSpot API error: ${hubspotResult.message}`);
      }
    } else {
      console.log('✅ Contact created successfully:', hubspotResult.id);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          contactId: hubspotResult.id,
          action: 'created'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('❌ Error in HubSpot lead capture:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to capture lead',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});