import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, HelpCircle, Pencil, PlayCircle, Plus, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const contentTypeIcons = {
  video: PlayCircle,
  text: FileText,
  quiz: HelpCircle,
  interactive: Sparkles
};

const emptyForm = {
  title: "",
  description: "",
  type: "text",
  difficulty_level: "beginner",
  category: "",
  estimated_duration: 10,
  cognitive_load_rating: 5,
  content_body: "",
  order_index: 0,
  quiz_questions: []
};

export default function AdminContent() {
  const [user, setUser] = useState(null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsCheckingUser(false));
  }, []);

  const { data: content } = useQuery({
    queryKey: ["adminContent"],
    queryFn: () => base44.entities.Content.list("order_index", 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Content.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminContent"] });
      closeEditor();
      toast.success("Content created successfully");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Content.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminContent"] });
      closeEditor();
      toast.success("Content updated successfully");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Content.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminContent"] });
      toast.success("Content deleted");
    }
  });

  function closeEditor() {
    setIsOpen(false);
    setEditingContent(null);
    setFormData(emptyForm);
  }

  function handleEdit(item) {
    setEditingContent(item);
    setFormData({
      title: item.title || "",
      description: item.description || "",
      type: item.type || "text",
      difficulty_level: item.difficulty_level || "beginner",
      category: item.category || "",
      estimated_duration: item.estimated_duration || 10,
      cognitive_load_rating: item.cognitive_load_rating || 5,
      content_body: item.content_body || "",
      order_index: item.order_index || 0,
      quiz_questions: item.quiz_questions || []
    });
    setIsOpen(true);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (editingContent) {
      updateMutation.mutate({ id: editingContent.id, data: formData });
      return;
    }
    createMutation.mutate(formData);
  }

  function addQuizQuestion() {
    setFormData((current) => ({
      ...current,
      quiz_questions: [
        ...current.quiz_questions,
        { question: "", options: ["", "", "", ""], correct_answer: 0, explanation: "" }
      ]
    }));
  }

  function updateQuizQuestion(index, field, value) {
    const updated = [...formData.quiz_questions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((current) => ({ ...current, quiz_questions: updated }));
  }

  function removeQuizQuestion(index) {
    setFormData((current) => ({
      ...current,
      quiz_questions: current.quiz_questions.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  if (isCheckingUser) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <p className="text-slate-600">Checking access...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Admin Access Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Manage Content is only available to admin users.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Content Management</h1>
            <p className="text-slate-500">Create and manage learning content</p>
          </div>
          <Button className="gap-2 bg-violet-600 hover:bg-violet-700" onClick={() => setIsOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Content
          </Button>
        </div>

        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border-0 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>{editingContent ? "Edit Content" : "Create New Content"}</CardTitle>
                <Button variant="ghost" size="icon" onClick={closeEditor}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <Label>Title</Label>
                      <Input required value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea rows={2} value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <select className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={formData.type} onChange={(event) => setFormData({ ...formData, type: event.target.value })}>
                        <option value="text">Text</option>
                        <option value="video">Video</option>
                        <option value="quiz">Quiz</option>
                        <option value="interactive">Interactive</option>
                      </select>
                    </div>
                    <div>
                      <Label>Difficulty</Label>
                      <select className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={formData.difficulty_level} onChange={(event) => setFormData({ ...formData, difficulty_level: event.target.value })}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input value={formData.category} onChange={(event) => setFormData({ ...formData, category: event.target.value })} />
                    </div>
                    <div>
                      <Label>Duration (min)</Label>
                      <Input type="number" value={formData.estimated_duration} onChange={(event) => setFormData({ ...formData, estimated_duration: Number(event.target.value) })} />
                    </div>
                    <div>
                      <Label>Cognitive Load (1-10)</Label>
                      <Input type="number" min={1} max={10} value={formData.cognitive_load_rating} onChange={(event) => setFormData({ ...formData, cognitive_load_rating: Number(event.target.value) })} />
                    </div>
                    <div>
                      <Label>Order Index</Label>
                      <Input type="number" value={formData.order_index} onChange={(event) => setFormData({ ...formData, order_index: Number(event.target.value) })} />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Content Body (Text/Markdown or Video URL)</Label>
                      <Textarea rows={5} value={formData.content_body} onChange={(event) => setFormData({ ...formData, content_body: event.target.value })} />
                    </div>
                  </div>

                  {formData.type === "quiz" && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <Label>Quiz Questions</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addQuizQuestion}>
                          <Plus className="mr-1 h-4 w-4" />
                          Add Question
                        </Button>
                      </div>
                      {formData.quiz_questions.map((question, index) => (
                        <Card key={index} className="border border-slate-200 shadow-sm">
                          <CardContent className="space-y-3 p-4">
                            <div className="flex items-center justify-between">
                              <Label>Question {index + 1}</Label>
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeQuizQuestion(index)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                            <Input value={question.question} placeholder="Question text" onChange={(event) => updateQuizQuestion(index, "question", event.target.value)} />
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                              {question.options.map((option, optionIndex) => (
                                <Input
                                  key={optionIndex}
                                  value={option}
                                  placeholder={`Option ${optionIndex + 1}`}
                                  onChange={(event) => {
                                    const nextOptions = [...question.options];
                                    nextOptions[optionIndex] = event.target.value;
                                    updateQuizQuestion(index, "options", nextOptions);
                                  }}
                                />
                              ))}
                            </div>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                              <div>
                                <Label className="text-xs">Correct Answer (0-3)</Label>
                                <Input type="number" min={0} max={3} value={question.correct_answer} onChange={(event) => updateQuizQuestion(index, "correct_answer", Number(event.target.value))} />
                              </div>
                              <div>
                                <Label className="text-xs">Explanation</Label>
                                <Input value={question.explanation} onChange={(event) => updateQuizQuestion(index, "explanation", event.target.value)} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={closeEditor}>Cancel</Button>
                    <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
                      {editingContent ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr className="text-left text-sm text-slate-500">
                    <th className="px-6 py-4 font-medium">Content</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Difficulty</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Duration</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {content?.map((item) => {
                    const Icon = contentTypeIcons[item.type] || FileText;
                    return (
                      <tr key={item.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-slate-100 p-2">
                              <Icon className="h-4 w-4 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{item.title}</p>
                              <p className="max-w-xs truncate text-sm text-slate-500">{item.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><Badge variant="secondary">{item.type}</Badge></td>
                        <td className="px-6 py-4"><Badge variant="outline">{item.difficulty_level}</Badge></td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.estimated_duration} min</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
