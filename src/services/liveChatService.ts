
import { supabase } from '@/integrations/supabase/client';
import { LiveChatSession } from '@/types/auth';

export const createChatSession = async (
  studentId: string | null,
  studentName: string,
  school: string,
  grade: string,
  isAnonymous: boolean
): Promise<{ error?: string; session?: LiveChatSession }> => {
  try {
    console.log('Creating chat session:', { studentId, studentName, school, grade, isAnonymous });
    
    const { data: session, error } = await supabase
      .from('live_chat_sessions')
      .insert({
        student_id: studentId,
        student_name: studentName,
        school: school,
        grade: grade,
        is_anonymous: isAnonymous,
        status: 'waiting'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat session:', error);
      return { error: 'Failed to start chat session. Please try again.' };
    }

    console.log('Chat session created successfully:', session);
    return { session };
  } catch (error) {
    console.error('Unexpected error creating chat session:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
};

export const endChatSession = async (sessionId: string): Promise<{ error?: string }> => {
  try {
    console.log('Ending chat session:', sessionId);
    
    const { error } = await supabase
      .from('live_chat_sessions')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error ending chat session:', error);
      return { error: 'Failed to end chat session.' };
    }

    console.log('Chat session ended successfully');
    return {};
  } catch (error) {
    console.error('Unexpected error ending chat session:', error);
    return { error: 'An unexpected error occurred.' };
  }
};

export const getAvailableDoctors = async (school: string): Promise<{ error?: string; doctors?: any[] }> => {
  try {
    console.log('Fetching available doctors for school:', school);
    
    const { data: doctors, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('school', school)
      .eq('role', 'doctor')
      .eq('is_available', true);

    if (error) {
      console.error('Error fetching doctors:', error);
      return { error: 'Failed to fetch available doctors.' };
    }

    console.log('Available doctors:', doctors);
    return { doctors: doctors || [] };
  } catch (error) {
    console.error('Unexpected error fetching doctors:', error);
    return { error: 'An unexpected error occurred.' };
  }
};
