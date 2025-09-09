import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth";
import { X, Trash2 } from "lucide-react";
import type { Link } from "@shared/schema";

const linkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Please enter a valid URL"),
  icon: z.string().min(1, "Please select an icon"),
  isActive: z.boolean().default(true),
});

type LinkFormData = z.infer<typeof linkSchema>;

const iconOptions = [
  { value: "fas fa-link", label: "Link" },
  { value: "fab fa-github", label: "GitHub" },
  { value: "fab fa-linkedin", label: "LinkedIn" },
  { value: "fab fa-twitter", label: "Twitter" },
  { value: "fab fa-instagram", label: "Instagram" },
  { value: "fab fa-facebook", label: "Facebook" },
  { value: "fab fa-youtube", label: "YouTube" },
  { value: "fas fa-globe", label: "Website" },
  { value: "fas fa-envelope", label: "Email" },
  { value: "fas fa-blog", label: "Blog" },
  { value: "fab fa-discord", label: "Discord" },
  { value: "fab fa-tiktok", label: "TikTok" },
];

interface LinkEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link?: Link | null;
}

export function LinkEditor({ open, onOpenChange, link }: LinkEditorProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: link?.title || "",
      url: link?.url || "",
      icon: link?.icon || "fas fa-link",
      isActive: link?.isActive ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: LinkFormData) => {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          ...data,
          position: 0, // Will be handled by backend
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({ title: "Link created successfully!" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: LinkFormData) => {
      const response = await fetch(`/api/links/${link!.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({ title: "Link updated successfully!" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/links/${link!.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({ title: "Link deleted successfully!" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: LinkFormData) => {
    if (link) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteMutation.mutate();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          setShowDeleteConfirm(false);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-md" data-testid="link-editor-modal">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>
            {link ? "Edit Link" : "Add New Link"}
          </DialogTitle>
          <div className="flex items-center space-x-2">
            {link && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className={showDeleteConfirm ? "text-destructive" : ""}
                data-testid="button-delete-link"
              >
                <Trash2 className="h-4 w-4" />
                {showDeleteConfirm ? "Confirm?" : ""}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-editor"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Link title"
                      data-testid="input-link-title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      data-testid="input-link-url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-link-icon">
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <i className={option.value} />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-link"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : link
                ? "Update Link"
                : "Create Link"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
