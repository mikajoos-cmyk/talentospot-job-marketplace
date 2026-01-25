import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface CandidateFiltersProps {
  filters: {
    salary: number[];
    bonus: number[];
    radius: number;
    isRefugee: boolean;
    country: string;
    skills: string[];
  };
  onFiltersChange: (filters: any) => void;
}

const CandidateFilters: React.FC<CandidateFiltersProps> = ({ filters, onFiltersChange }) => {
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim() && !filters.skills.includes(skillInput.trim())) {
      onFiltersChange({
        ...filters,
        skills: [...filters.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    onFiltersChange({
      ...filters,
      skills: filters.skills.filter(s => s !== skill),
    });
  };

  const handleReset = () => {
    onFiltersChange({
      salary: [30000, 120000],
      bonus: [0, 50000],
      radius: 50,
      isRefugee: false,
      country: '',
      skills: [],
    });
  };

  return (
    <Card className="p-6 border border-border bg-card sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-h4 font-heading text-foreground">Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleReset}
          className="bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground font-normal"
        >
          Reset
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-body-sm font-medium text-foreground mb-3 block">
            Salary Range: ${filters.salary[0].toLocaleString()} - ${filters.salary[1].toLocaleString()}
          </Label>
          <Slider
            value={filters.salary}
            onValueChange={(value) => onFiltersChange({ ...filters, salary: value })}
            min={20000}
            max={200000}
            step={5000}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-body-sm font-medium text-foreground mb-3 block">
            Bonus Range: ${filters.bonus[0].toLocaleString()} - ${filters.bonus[1].toLocaleString()}
          </Label>
          <Slider
            value={filters.bonus}
            onValueChange={(value) => onFiltersChange({ ...filters, bonus: value })}
            min={0}
            max={100000}
            step={5000}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-body-sm font-medium text-foreground mb-3 block">
            Search Radius: {filters.radius} miles
          </Label>
          <Slider
            value={[filters.radius]}
            onValueChange={(value) => onFiltersChange({ ...filters, radius: value[0] })}
            min={10}
            max={100}
            step={5}
            className="mt-2"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="refugee-filter" className="text-body-sm font-medium text-foreground">
            Refugee/Immigrant
          </Label>
          <Switch
            id="refugee-filter"
            checked={filters.isRefugee}
            onCheckedChange={(checked) => onFiltersChange({ ...filters, isRefugee: checked })}
          />
        </div>

        {filters.isRefugee && (
          <div>
            <Label className="text-body-sm font-medium text-foreground mb-2 block">
              Country of Origin
            </Label>
            <Select value={filters.country} onValueChange={(value) => onFiltersChange({ ...filters, country: value })}>
              <SelectTrigger className="bg-background text-foreground border-border">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Syria">Syria</SelectItem>
                <SelectItem value="Afghanistan">Afghanistan</SelectItem>
                <SelectItem value="Iraq">Iraq</SelectItem>
                <SelectItem value="Ukraine">Ukraine</SelectItem>
                <SelectItem value="Venezuela">Venezuela</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label className="text-body-sm font-medium text-foreground mb-2 block">
            Skills
          </Label>
          <div className="flex space-x-2 mb-3">
            <Input
              type="text"
              placeholder="Add skill..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              className="flex-1 bg-background text-foreground border-border"
            />
            <Button 
              size="icon" 
              onClick={handleAddSkill}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              <Plus className="w-5 h-5" strokeWidth={2} />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.skills.map((skill) => (
              <div
                key={skill}
                className="flex items-center space-x-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-body-sm"
              >
                <span>{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-primary-hover"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CandidateFilters;
