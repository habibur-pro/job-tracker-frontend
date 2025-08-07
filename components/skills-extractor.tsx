"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from 'lucide-react'

interface SkillsExtractorProps {
  skills: string[]
  onAddSkill: (skill: string) => void
  onRemoveSkill: (skill: string) => void
}

const suggestedSkills = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'C++',
  'HTML', 'CSS', 'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL',
  'Vue.js', 'Angular', 'Express.js', 'GraphQL', 'REST API', 'Git'
]

export function SkillsExtractor({ skills, onAddSkill, onRemoveSkill }: SkillsExtractorProps) {
  const [newSkill, setNewSkill] = useState("")

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      onAddSkill(newSkill.trim())
      setNewSkill("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSkill()
    }
  }

  const availableSuggestions = suggestedSkills.filter(skill => !skills.includes(skill))

  return (
    <div className="space-y-4">
      {/* Current Skills */}
      <div>
        <h4 className="text-sm font-medium mb-2">Your Skills ({skills.length})</h4>
        <div className="flex flex-wrap gap-2">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <Badge key={skill} variant="default" className="flex items-center space-x-1">
                <span>{skill}</span>
                <button
                  onClick={() => onRemoveSkill(skill)}
                  className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No skills added yet</p>
          )}
        </div>
      </div>

      {/* Add New Skill */}
      <div>
        <h4 className="text-sm font-medium mb-2">Add New Skill</h4>
        <div className="flex space-x-2">
          <Input
            placeholder="Enter a skill (e.g., React, Python, AWS)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleAddSkill} disabled={!newSkill.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Suggested Skills */}
      {availableSuggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Suggested Skills</h4>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.slice(0, 10).map((skill) => (
              <Badge 
                key={skill} 
                variant="outline" 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => onAddSkill(skill)}
              >
                <Plus className="h-3 w-3 mr-1" />
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
