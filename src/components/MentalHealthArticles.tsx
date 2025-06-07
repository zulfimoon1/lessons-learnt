
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
import { BookOpenIcon, PlusIcon, TrashIcon, EditIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Article {
  id: string;
  title: string;
  content: string;
  age_group: string;
  school: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface MentalHealthArticlesProps {
  teacher: {
    id: string;
    school: string;
    role: string;
  };
}

const MentalHealthArticles = ({ teacher }: MentalHealthArticlesProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    age_group: '',
  });
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (teacher.role === 'admin') {
      loadArticles();
    }
  }, [teacher]);

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('mental_health_articles')
        .select('*')
        .eq('school', teacher.school)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast({
        title: t('common.error'),
        description: t('articles.loadFailed'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.age_group) {
      toast({
        title: t('common.error'),
        description: t('articles.fillRequired'),
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingArticle) {
        const { error } = await supabase
          .from('mental_health_articles')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingArticle.id);

        if (error) throw error;
        
        toast({
          title: t('articles.updated'),
          description: t('articles.updatedSuccess'),
        });
      } else {
        const { error } = await supabase
          .from('mental_health_articles')
          .insert({
            ...formData,
            school: teacher.school,
            created_by: teacher.id
          });

        if (error) throw error;
        
        toast({
          title: t('articles.created'),
          description: t('articles.createdSuccess'),
        });
      }

      setFormData({ title: '', content: '', age_group: '' });
      setShowForm(false);
      setEditingArticle(null);
      loadArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: t('common.error'),
        description: t('articles.saveFailed'),
        variant: "destructive",
      });
    }
  };

  const handleEdit = (article: Article) => {
    setFormData({
      title: article.title,
      content: article.content,
      age_group: article.age_group,
    });
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('articles.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('mental_health_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: t('articles.deleted'),
        description: t('articles.deletedSuccess'),
      });
      
      loadArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: t('common.error'),
        description: t('articles.deleteFailed'),
        variant: "destructive",
      });
    }
  };

  if (teacher.role !== 'admin') {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p>{t('common.loading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5" />
                {t('articles.title')}
              </CardTitle>
              <CardDescription>
                {t('articles.description')}
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setShowForm(!showForm);
                setEditingArticle(null);
                setFormData({ title: '', content: '', age_group: '' });
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              {t('articles.addNew')}
            </Button>
          </div>
        </CardHeader>
        
        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">{t('articles.articleTitle')}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('articles.titlePlaceholder')}
                />
              </div>
              
              <div>
                <Label htmlFor="age_group">{t('articles.ageGroup')}</Label>
                <Select value={formData.age_group} onValueChange={(value) => setFormData(prev => ({ ...prev, age_group: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('articles.selectAgeGroup')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elementary">{t('articles.elementary')}</SelectItem>
                    <SelectItem value="middle">{t('articles.middle')}</SelectItem>
                    <SelectItem value="high">{t('articles.high')}</SelectItem>
                    <SelectItem value="all">{t('articles.allAges')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="content">{t('articles.content')}</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={t('articles.contentPlaceholder')}
                  rows={6}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingArticle ? t('common.save') : t('articles.create')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingArticle(null);
                    setFormData({ title: '', content: '', age_group: '' });
                  }}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {articles.length > 0 && (
        <div className="grid gap-4">
          {articles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{t(`articles.${article.age_group}`)}</Badge>
                      <Badge variant="secondary">
                        {new Date(article.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(article)}
                    >
                      <EditIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(article.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{article.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {articles.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('articles.noArticles')}</p>
            <p className="text-sm text-gray-500 mt-2">{t('articles.getStarted')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MentalHealthArticles;
