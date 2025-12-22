"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { newsletterApi, Newsletter } from "@/lib/api";
import { getBackendToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  RefreshCw,
  Trash2,
  Send,
  Inbox,
  FolderArchive,
  Loader2,
} from "lucide-react";

export default function NewslettersPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      const data = await newsletterApi.getAll();
      setNewsletters(data);
    } catch (error: any) {
      console.error("Failed to fetch newsletters:", error);
      toast.error(error.message || "Failed to load newsletters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAndFetch = async () => {
      if (isSignedIn && user) {
        await getBackendToken(user);
        fetchNewsletters();
      }
    };
    initAndFetch();
  }, [isSignedIn, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("Please enter a newsletter title");
      return;
    }

    try {
      setSending(true);
      await newsletterApi.send({
        title: formData.title,
        content: formData.content || "",
      });
      toast.success("Newsletter created successfully!");
      setIsDialogOpen(false);
      setFormData({ title: "", content: "" });
      fetchNewsletters();
    } catch (error: any) {
      console.error("Failed to send newsletter:", error);
      toast.error(error.message || "Failed to send newsletter");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await newsletterApi.delete(id);
      toast.success("Newsletter deleted");
      fetchNewsletters();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete newsletter");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-6 py-4">
            <Skeleton className="h-12 w-64" />
          </div>
        </div>
        <div className="container mx-auto px-6 py-6 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Newsletters</h1>
                <p className="text-sm text-muted-foreground">
                  {newsletters.length} {newsletters.length === 1 ? "newsletter" : "newsletters"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={fetchNewsletters}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Newsletter
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create Newsletter</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSend} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="Newsletter title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        placeholder="Newsletter content..."
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        className="min-h-[200px]"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={sending}>
                        {sending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Create Newsletter
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
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
                  variant="default"
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Newsletters
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
            {newsletters.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No newsletters yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first newsletter to get started.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Newsletter
                </Button>
              </Card>
            ) : (
              <div className="space-y-2">
                {newsletters.map((newsletter) => (
                  <Card
                    key={newsletter.id}
                    className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                      selectedNewsletter?.id === newsletter.id ? "bg-accent border-primary" : ""
                    }`}
                    onClick={() => setSelectedNewsletter(newsletter)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-lg mb-1 truncate">
                          {newsletter.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {newsletter.content?.substring(0, 150) || "No content"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(newsletter.created_at)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(newsletter.id);
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {selectedNewsletter && (
              <Card className="mt-6 p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        {selectedNewsletter.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Created: {formatDate(selectedNewsletter.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedNewsletter(null)}
                    >
                      Close
                    </Button>
                  </div>
                  <hr />
                  <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                    {selectedNewsletter.content || "No content"}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
