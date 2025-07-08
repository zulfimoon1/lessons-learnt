import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslationRequest {
  texts: string[];
  targetLanguage: string;
  sourceLanguage?: string;
}

interface DeepLTranslation {
  text: string;
  detected_source_language?: string;
}

interface DeepLResponse {
  translations: DeepLTranslation[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texts, targetLanguage, sourceLanguage = 'EN' }: TranslationRequest = await req.json();
    
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Texts array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!targetLanguage) {
      return new Response(
        JSON.stringify({ success: false, error: 'Target language is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const deeplApiKey = Deno.env.get('DEEPL_API_KEY');
    console.log('🔑 API Key status:', deeplApiKey ? 'Present' : 'Missing');
    
    if (!deeplApiKey) {
      console.error('❌ DEEPL_API_KEY environment variable not found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'DeepL API key not configured. Please set DEEPL_API_KEY in Supabase secrets.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔄 Translating ${texts.length} texts to ${targetLanguage}`);

    // Prepare request body for DeepL API - DeepL expects JSON, not FormData
    const requestBody = {
      text: texts,
      target_lang: targetLanguage.toUpperCase(),
      source_lang: sourceLanguage.toUpperCase()
    };

    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
    console.log('🌐 Making request to DeepL API...');
    
    // Call DeepL API
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${deeplApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 DeepL API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DeepL API error response:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `DeepL API error: ${response.status} ${response.statusText} - ${errorText}` 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: DeepLResponse = await response.json();
    
    if (!data.translations || data.translations.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No translations returned from DeepL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Successfully translated ${data.translations.length} texts`);

    // Return translations
    const translations = data.translations.map(t => t.text);
    
    return new Response(
      JSON.stringify({
        success: true,
        translations,
        sourceLanguage: data.translations[0]?.detected_source_language || sourceLanguage,
        targetLanguage,
        count: translations.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Translation system error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});