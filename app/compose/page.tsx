"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { emailApi, aiApi } from "@/lib/api";
import { getBackendToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Send,
  ArrowLeft,
  Inbox,
  FolderArchive,
  Trash2,
  Loader2,
  Sparkles,
  Wand2,
  MessageSquare,
  FileText,
  ChevronDown,
} from "lucide-react";

export default function ComposePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sending, setSending] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState("professional");
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    recipient: "",
    subject: "",
    body: "",
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const initAuth = async () => {
      if (isSignedIn && user) {
        await getBackendToken(user);
      }
    };
    initAuth();
  }, [isSignedIn, user]);

  useEffect(() => {
    const to = searchParams.get("to");
    const subject = searchParams.get("subject");
    const body = searchParams.get("body");

    if (to || subject || body) {
      setFormData({
        recipient: to || "",
        subject: subject || "",
        body: body || "",
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.recipient || !formData.subject) {
      toast.error("Please fill in recipient and subject");
      return;
    }

    try {
      setSending(true);
      await emailApi.send({
        recipient: formData.recipient,
        subject: formData.subject,
        body: formData.body || "<p></p>",
      });
      toast.success("Email sent successfully!");
      router.push("/sent");
    } catch (error: any) {
      console.error("Failed to send email:", error);
      toast.error(error.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  const handleAiCompose = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please describe what you want to write");
      return;
    }

    try {
      setAiLoading(true);
      const result = await aiApi.compose({
        prompt: aiPrompt,
        tone: aiTone,
      });
      setFormData({ ...formData, body: result.content });
      setShowAiPrompt(false);
      setAiPrompt("");
      toast.success("Email draft generated");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate email");
    } finally {
      setAiLoading(false);
    }
  };

  const handleImprove = async (instruction: string) => {
    if (!formData.body.trim()) {
      toast.error("Please write some content first");
      return;
    }

    try {
      setAiLoading(true);
      const result = await aiApi.improve({
        text: formData.body,
        instruction,
      });
      setFormData({ ...formData, body: result.content });
      toast.success("Text improved");
    } catch (error: any) {
      toast.error(error.message || "Failed to improve text");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateSubjectLines = async () => {
    if (!formData.body.trim()) {
      toast.error("Please write email content first");
      return;
    }

    try {
      setAiLoading(true);
      const result = await aiApi.generateSubjectLines({
        email_body: formData.body,
        count: 3,
      });
      setSubjectSuggestions(result.subject_lines);
      setShowSubjectSuggestions(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate subject lines");
    } finally {
      setAiLoading(false);
    }
  };

  const selectSubjectLine = (subject: string) => {
    setFormData({ ...formData, subject });
    setShowSubjectSuggestions(false);
    toast.success("Subject line applied");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Compose</h1>
                <p className="text-sm text-muted-foreground">
                  Write a new email
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push("/inbox")}
                >
                  <Inbox className="h-4 w-4 mr-2" />
                  Inbox
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push("/sent")}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Sent
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push("/archive")}
                >
                  <FolderArchive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push("/trash")}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Trash
                </Button>
              </nav>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="recipient">To</Label>
                  <Input
                    id="recipient"
                    type="email"
                    placeholder="recipient@example.com"
                    value={formData.recipient}
                    onChange={(e) =>
                      setFormData({ ...formData, recipient: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="subject">Subject</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateSubjectLines}
                      disabled={aiLoading || !formData.body.trim()}
                    >
                      {aiLoading ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3 mr-1" />
                      )}
                      Suggest
                    </Button>
                  </div>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Email subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                  />
                  {showSubjectSuggestions && subjectSuggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {subjectSuggestions.map((subject, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left h-auto py-2"
                          onClick={() => selectSubjectLine(subject)}
                        >
                          {subject}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="body">Message</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={aiLoading}
                        >
                          {aiLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                          )}
                          AI Assist
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setShowAiPrompt(true)}>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Write email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleImprove("improve")}
                          disabled={!formData.body.trim()}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Improve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleImprove("shorter")}
                          disabled={!formData.body.trim()}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Make shorter
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleImprove("longer")}
                          disabled={!formData.body.trim()}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Make longer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger disabled={!formData.body.trim()}>
                            Change tone
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleImprove("formal")}>
                              Formal
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleImprove("casual")}>
                              Casual
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleImprove("friendly")}>
                              Friendly
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleImprove("urgent")}>
                              Urgent
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Textarea
                    id="body"
                    placeholder="Write your message here..."
                    value={formData.body}
                    onChange={(e) =>
                      setFormData({ ...formData, body: e.target.value })
                    }
                    className="min-h-[300px] resize-y"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={sending}>
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showAiPrompt} onOpenChange={setShowAiPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write with AI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>What would you like to write?</Label>
              <Textarea
                placeholder="e.g., Thank the client for the meeting and confirm next steps..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <div className="flex gap-2 flex-wrap">
                {["professional", "casual", "friendly", "formal"].map((tone) => (
                  <Button
                    key={tone}
                    type="button"
                    variant={aiTone === tone ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAiTone(tone)}
                  >
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAiPrompt(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAiCompose}
                disabled={aiLoading || !aiPrompt.trim()}
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
