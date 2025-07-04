"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { api } from "~/trpc/react";
import { Loader2 } from "lucide-react";
import type { GreenhouseQuestion } from "~/server/api/routers/greenhouse";

interface DynamicApplicationFormProps {
  jobId: string;
  companySlug: string;
  questions: GreenhouseQuestion[];
}

export function DynamicApplicationForm({ jobId, companySlug, questions }: DynamicApplicationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<Record<string, any>>({});

  const submitApplication = api.greenhouse.submitApplication.useMutation({
    onSuccess: () => {
      router.push(`/${companySlug}/jobs/${jobId}/application-submitted`);
    },
    onError: (error) => {
      alert(`Failed to submit application: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleFileChange = async (name: string, file: File | null) => {
    if (!file) {
      setFormData(prev => {
        const newData = { ...prev };
        delete newData[name];
        return newData;
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (typeof reader.result === 'string' ? reader.result.split(',')[1] : undefined) ?? '';
      setFormData(prev => ({
        ...prev,
        [name]: {
          filename: file.name,
          content: base64,
          contentType: file.type,
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await submitApplication.mutateAsync({
      jobId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      formData: formData as any,
    });
  };

  const renderField = (question: GreenhouseQuestion) => {
    const isRequired = question.required === true;
    
    switch (question.type) {
      case 'short_text':
        if (question.name === 'email') {
          return (
            <Input
              type="email"
              id={question.name}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              value={formData[question.name] ?? ''}
              onChange={(e) => setFormData(prev => ({ ...prev, [question.name]: e.target.value }))}
              required={isRequired}
            />
          );
        }
        if (question.name === 'phone') {
          return (
            <Input
              type="tel"
              id={question.name}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              value={formData[question.name] ?? ''}
              onChange={(e) => setFormData(prev => ({ ...prev, [question.name]: e.target.value }))}
              required={isRequired}
            />
          );
        }
        return (
          <Input
            type="text"
            id={question.name}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={formData[question.name] ?? ''}
            onChange={(e) => setFormData(prev => ({ ...prev, [question.name]: e.target.value }))}
            required={isRequired}
          />
        );

      case 'long_text':
        return (
          <Textarea
            id={question.name}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={formData[question.name] ?? ''}
            onChange={(e) => setFormData(prev => ({ ...prev, [question.name]: e.target.value }))}
            required={isRequired}
            rows={4}
          />
        );

      case 'attachment':
        if (question.name === 'cover_letter') {
          return (
            <Textarea
              id={question.name}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              value={formData[question.name] ?? ''}
              onChange={(e) => setFormData(prev => ({ ...prev, [question.name]: e.target.value }))}
              required={isRequired}
              rows={6}
              placeholder="Write your cover letter here..."
            />
          );
        }

        return (
          <Input
            type="file"
            id={question.name}
            onChange={(e) => handleFileChange(question.name, e.target.files?.[0] ?? null)}
            accept={question.name === 'resume' ? '.pdf,.doc,.docx' : undefined}
            required={isRequired}
          />
        );

      case 'multi_value_single_select':
        return (
          <Select
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={formData[question.name] ?? ''}
            onValueChange={(value) => setFormData(prev => ({ ...prev, [question.name]: value }))}
            required={isRequired}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.values.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            type="text"
            id={question.name}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={formData[question.name] ?? ''}
            onChange={(e) => setFormData(prev => ({ ...prev, [question.name]: e.target.value }))}
            required={isRequired}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((question) => (
        <div key={question.name} className="space-y-2">
          <Label htmlFor={question.name}>
            {question.label}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {renderField(question)}
          {question.description && (
            <p className="text-sm text-muted-foreground">{question.description}</p>
          )}
        </div>
      ))}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Application'
        )}
      </Button>
    </form>
  );
}
