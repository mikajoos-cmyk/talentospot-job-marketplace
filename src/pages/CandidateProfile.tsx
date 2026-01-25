import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/contexts/UserContext';
import { MapPin, Mail, Phone, Briefcase, GraduationCap, Award } from 'lucide-react';

const CandidateProfile: React.FC = () => {
  const { user } = useUser();
  const profileCompletion = 75;

  const experiences = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      period: '2020 - Present',
      description: 'Leading frontend development team, building scalable React applications.',
    },
    {
      id: '2',
      title: 'Frontend Developer',
      company: 'StartupXYZ',
      period: '2018 - 2020',
      description: 'Developed user interfaces and improved application performance.',
    },
  ];

  const education = [
    {
      id: '1',
      degree: 'Bachelor of Computer Science',
      institution: 'University of Technology',
      period: '2014 - 2018',
    },
  ];

  const skills = [
    'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker',
    'GraphQL', 'MongoDB', 'PostgreSQL', 'Git', 'Agile', 'CI/CD'
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-h1 font-heading text-foreground mb-2">My Profile</h1>
            <p className="text-body text-muted-foreground">Manage your professional information.</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal">
            Edit Profile
          </Button>
        </div>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-h3">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-h2 font-heading text-foreground mb-2">{user.name}</h2>
              <p className="text-body text-muted-foreground mb-4">Senior Frontend Developer</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <div className="flex items-center text-body-sm text-foreground">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center text-body-sm text-foreground">
                  <Phone className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center text-body-sm text-foreground">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>New York, NY</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body-sm font-medium text-foreground">Profile Completion</span>
                  <span className="text-body-sm text-muted-foreground">{profileCompletion}%</span>
                </div>
                <Progress value={profileCompletion} className="h-2" />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-6">
                <Briefcase className="w-6 h-6 text-primary" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Work Experience</h3>
              </div>

              <div className="space-y-6">
                {experiences.map((exp, index) => (
                  <div key={exp.id} className="relative pl-6 border-l-2 border-border">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary"></div>
                    <h4 className="text-h4 font-heading text-foreground mb-1">{exp.title}</h4>
                    <p className="text-body-sm text-muted-foreground mb-2">
                      {exp.company} • {exp.period}
                    </p>
                    <p className="text-body-sm text-foreground">{exp.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-6">
                <GraduationCap className="w-6 h-6 text-primary" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Education</h3>
              </div>

              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="relative pl-6 border-l-2 border-border">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-accent"></div>
                    <h4 className="text-h4 font-heading text-foreground mb-1">{edu.degree}</h4>
                    <p className="text-body-sm text-muted-foreground">
                      {edu.institution} • {edu.period}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center space-x-3 mb-6">
                <Award className="w-6 h-6 text-primary" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground">Skills</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-2 bg-primary/10 text-primary text-body-sm rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CandidateProfile;
