import type { GreenhouseQuestion } from "../routers/greenhouse";

export const getDefaultJobContent = (jobName: string, departmentName: string, officeName: string): string => {
  return `
    <div class="prose prose-sm max-w-none">
      <h3>About this role</h3>
      <p>We are looking for a talented ${jobName} to join our ${departmentName} in ${officeName}. This is an exciting opportunity to make a significant impact in a growing organization.</p>
      
      <h3>What you'll do</h3>
      <ul>
        <li>Collaborate with cross-functional teams to deliver high-quality solutions</li>
        <li>Take ownership of key projects and drive them to completion</li>
        <li>Contribute to the growth and success of our organization</li>
        <li>Participate in strategic planning and decision-making processes</li>
      </ul>
      
      <h3>What we're looking for</h3>
      <ul>
        <li>Strong technical skills and relevant experience</li>
        <li>Excellent communication and collaboration abilities</li>
        <li>Problem-solving mindset and attention to detail</li>
        <li>Passion for innovation and continuous learning</li>
      </ul>
    </div>
  `;
};

export const getDefaultQuestions = (): GreenhouseQuestion[] => [
  { required: true, private: false, label: "First Name", name: "first_name", type: "short_text", values: [], description: null },
  { required: true, private: false, label: "Last Name", name: "last_name", type: "short_text", values: [], description: null },
  { required: true, private: false, label: "Email", name: "email", type: "short_text", values: [], description: null },
  { required: false, private: false, label: "Phone", name: "phone", type: "short_text", values: [], description: null },
  { required: false, private: false, label: "Resume", name: "resume", type: "attachment", values: [], description: null },
  { required: false, private: false, label: "Cover Letter", name: "cover_letter", type: "attachment", values: [], description: null },
];