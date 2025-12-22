"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { emailApi } from "@/lib/api";
import { getBackendToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Send,
  ArrowLeft,
  Inbox,
  FolderArchive,
  Trash2,
  Loader2,
} from "lucide-react";

export default function ComposePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [sending, setSending] = useState(false);
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
                  <Label htmlFor="subject">Subject</Label>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Message</Label>
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
    </div>
  );
}
