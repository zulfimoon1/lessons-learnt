
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NotebookPenIcon, PlusIcon, TrashIcon, EditIcon, UploadIcon, SearchIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string;
  school: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  file_url?: string;
  file_name?: string;
}

interface TeacherNotebookProps {
  teacher: {
    id: string;
    school: string;
    role: string;
  };
}

const TeacherNotebook = ({ teacher }: TeacherNotebookProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    loadNotes();
  }, [teacher]);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_notes')
        .select('*')
        .eq('school', teacher.school)
        .eq('created_by', teacher.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading notes:', error);
        throw error;
      }

      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to load notes',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || (!formData.content.trim() && !selectedFile)) {
      toast({
        title: t('common.error'),
        description: 'Please provide a title and either content or upload a file',
        variant: "destructive",
      });
      return;
    }

    try {
      let fileUrl = '';
      let uploadedFileName = '';

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const uniqueFileName = `${Date.now()}.${fileExt}`;
        const filePath = `teacher-notes/${teacher.id}/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('teacher-files')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('teacher-files')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        uploadedFileName = selectedFile.name;
      }

      const noteData = {
        ...formData,
        school: teacher.school,
        created_by: teacher.id,
        file_url: fileUrl,
        file_name: uploadedFileName
      };

      if (editingNote) {
        const { error } = await supabase
          .from('teacher_notes')
          .update({
            ...noteData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingNote.id);

        if (error) throw error;
        
        toast({
          title: t('notes.noteSaved'),
          description: 'Note updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('teacher_notes')
          .insert(noteData);

        if (error) throw error;
        
        toast({
          title: t('notes.noteSaved'),
          description: 'Note created successfully',
        });
      }

      setFormData({ title: '', content: '', category: '', tags: '' });
      setSelectedFile(null);
      setShowForm(false);
      setEditingNote(null);
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: t('common.error'),
        description: t('notes.uploadFailed'),
        variant: "destructive",
      });
    }
  };

  const handleEdit = (note: Note) => {
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      tags: note.tags,
    });
    setEditingNote(note);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('notes.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('teacher_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: t('notes.noteDeleted'),
        description: 'Note deleted successfully',
      });
      
      loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to delete note',
        variant: "destructive",
      });
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal mx-auto mb-2"></div>
          <p>{t('common.loading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t('notes.searchNotes')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('notes.filterByCategory')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('notes.allCategories')}</SelectItem>
            <SelectItem value="lesson-planning">{t('notes.lessonPlanning')}</SelectItem>
            <SelectItem value="student-observations">{t('notes.studentObservations')}</SelectItem>
            <SelectItem value="professional-development">{t('notes.professionalDevelopment')}</SelectItem>
            <SelectItem value="resources">{t('notes.resources')}</SelectItem>
            <SelectItem value="other">{t('notes.other')}</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingNote(null);
            setFormData({ title: '', content: '', category: '', tags: '' });
            setSelectedFile(null);
          }}
          className="bg-brand-teal hover:bg-brand-teal/90"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          {t('notes.addNote')}
        </Button>
      </div>

      {/* Note Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingNote ? t('notes.editNote') : t('notes.addNote')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">{t('notes.noteTitle')}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('notes.noteTitlePlaceholder')}
                />
              </div>
              
              <div>
                <Label htmlFor="category">{t('notes.category')}</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('notes.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lesson-planning">{t('notes.lessonPlanning')}</SelectItem>
                    <SelectItem value="student-observations">{t('notes.studentObservations')}</SelectItem>
                    <SelectItem value="professional-development">{t('notes.professionalDevelopment')}</SelectItem>
                    <SelectItem value="resources">{t('notes.resources')}</SelectItem>
                    <SelectItem value="other">{t('notes.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="content">{t('notes.noteContent')}</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={t('notes.noteContentPlaceholder')}
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="file">{t('notes.articleFile')} (Optional)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <p className="text-sm text-gray-500 mt-1">{t('notes.supportedFormats')}</p>
              </div>

              <div>
                <Label htmlFor="tags">{t('notes.tags')}</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder={t('notes.tagsPlaceholder')}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-brand-teal hover:bg-brand-teal/90">
                  {editingNote ? t('common.save') : t('notes.saveNote')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingNote(null);
                    setFormData({ title: '', content: '', category: '', tags: '' });
                    setSelectedFile(null);
                  }}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      {filteredNotes.length > 0 && (
        <div className="grid gap-4">
          {filteredNotes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="outline">{t(`notes.${note.category.replace('-', '')}`)}</Badge>
                      <Badge variant="secondary">
                        {new Date(note.created_at).toLocaleDateString()}
                      </Badge>
                      {note.file_name && (
                        <Badge variant="outline" className="bg-blue-50">
                          <UploadIcon className="w-3 h-3 mr-1" />
                          {note.file_name}
                        </Badge>
                      )}
                      {note.tags && note.tags.split(',').map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(note)}
                    >
                      <EditIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(note.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {note.content && (
                  <p className="text-gray-700 whitespace-pre-wrap mb-3">{note.content}</p>
                )}
                {note.file_url && (
                  <a
                    href={note.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-brand-teal hover:text-brand-teal/80 text-sm"
                  >
                    <UploadIcon className="w-4 h-4" />
                    {note.file_name}
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {notes.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <NotebookPenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('notes.noNotes')}</p>
            <p className="text-sm text-gray-500 mt-2">{t('notes.getStarted')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherNotebook;
