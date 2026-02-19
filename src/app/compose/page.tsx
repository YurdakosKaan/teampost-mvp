"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createPost } from "@/app/actions/posts";

const MAX_LENGTH = 500;

export default function ComposePage() {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const remaining = MAX_LENGTH - content.length;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createPost(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>New post</CardTitle>
          <CardDescription>
            This post will be published under your team&apos;s identity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                name="content"
                placeholder="What's your team working on?"
                rows={4}
                maxLength={MAX_LENGTH}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="resize-none"
              />
              <div className="flex justify-end">
                <span
                  className={`text-xs ${
                    remaining < 50
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {remaining} characters remaining
                </span>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading || content.trim().length === 0}
              >
                {loading ? "Posting..." : "Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
