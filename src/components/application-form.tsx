"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Loader2, Upload } from "lucide-react";

interface ApplicationFormProps {
  jobId: string;
  jobTitle: string;
  companySlug: string;
}

export function ApplicationForm({ jobId, jobTitle, companySlug }: ApplicationFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const submitApplication = api.greenhouse.submitApplication.useMutation({
    onSuccess: () => {
      router.push(`/${companySlug}/jobs/${jobId}/application-submitted`);
    },
    onError: (error) => {
      setError(error.message || "Failed to submit application. Please try again.");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    if (!resumeFile) {
      setError("Please upload your resume");
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Content = reader.result?.toString().split(",")[1];
      
      if (!base64Content) {
        setError("Failed to process resume file");
        return;
      }

      await submitApplication.mutateAsync({
        jobId,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string || undefined,
        coverLetter: formData.get("coverLetter") as string || undefined,
        resume: {
          filename: resumeFile.name,
          content: base64Content,
          contentType: resumeFile.type,
        },
      });
    };
    
    reader.readAsDataURL(resumeFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a PDF, DOCX, DOC, or TXT file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size must be less than 5MB");
        return;
      }
      setResumeFile(file);
      setError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            name="firstName"
            required
            placeholder="John"
            disabled={submitApplication.isPending}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            name="lastName"
            required
            placeholder="Doe"
            disabled={submitApplication.isPending}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="john.doe@example.com"
          disabled={submitApplication.isPending}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          disabled={submitApplication.isPending}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="resume">Resume * (PDF, DOCX, DOC, or TXT)</Label>
        <div className="flex items-center gap-4">
          <Input
            id="resume"
            name="resume"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            disabled={submitApplication.isPending}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
          {resumeFile && (
            <span className="text-sm text-muted-foreground">
              {resumeFile.name}
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
        <Textarea
          id="coverLetter"
          name="coverLetter"
          placeholder="Tell us why you're interested in this position..."
          rows={6}
          disabled={submitApplication.isPending}
        />
      </div>
      
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={submitApplication.isPending}
      >
        {submitApplication.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting Application...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Submit Application
          </>
        )}
      </Button>
    </form>
  );
}