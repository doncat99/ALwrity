import React, { useMemo } from 'react';
import { BlogOutlineSection, BlogResearchResponse } from '../../services/blogWriterApi';

interface SuggestionsGeneratorProps {
  research: BlogResearchResponse | null;
  outline: BlogOutlineSection[];
}

export const useSuggestions = (research: BlogResearchResponse | null, outline: BlogOutlineSection[]) => {
  return useMemo(() => {
    const items = [] as { title: string; message: string }[];
    
    if (!research) {
      items.push({ title: '🔎 Start research', message: "I want to research a topic for my blog" });
    } else if (research && outline.length === 0) {
      // Research completed, guide user to outline creation
      items.push({ 
        title: '🧩 Create Outline', 
        message: 'Let\'s proceed to create an outline based on the research results'
      });
      items.push({ 
        title: '💬 Chat with Research Data', 
        message: 'I want to explore the research data and ask questions about the findings'
      });
      items.push({ 
        title: '🎨 Create Custom Outline', 
        message: 'I want to create an outline with my own specific instructions and requirements'
      });
    } else if (outline.length > 0) {
      // Outline created, focus on content generation
      items.push({ title: '📝 Generate all sections', message: 'Generate all sections of my blog post' });
      outline.forEach(s => items.push({ title: `✍️ Generate ${s.heading}`, message: `Generate the section: ${s.heading}` }));
      items.push({ title: '🔧 Refine outline', message: 'Help me refine the outline structure' });
      items.push({ title: '✨ Enhance outline', message: 'Optimize the entire outline for better flow and engagement' });
      items.push({ title: '⚖️ Rebalance word counts', message: 'Rebalance word count distribution across sections' });
      items.push({ title: '📈 Run SEO analysis', message: 'Analyze SEO for my blog post' });
      items.push({ title: '🧾 Generate SEO metadata', message: 'Generate SEO metadata and title' });
      items.push({ title: '🧪 Hallucination check', message: 'Check for any false claims in my content' });
      items.push({ title: '🚀 Publish to WordPress', message: 'Publish my blog to WordPress' });
    }
    
    return items;
  }, [research, outline]);
};

export const SuggestionsGenerator: React.FC<SuggestionsGeneratorProps> = ({ research, outline }) => {
  const suggestions = useSuggestions(research, outline);
  return null; // This is just a utility component
};

export default SuggestionsGenerator;
