import { useState } from 'react';
import './TagInput.css';

export default function TagInput({ tags, onChange, placeholder = 'Add a skill and press Enter...' }) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        onChange([...tags, input.trim()]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (idx) => {
    onChange(tags.filter((_, i) => i !== idx));
  };

  return (
    <div className="tag-input-wrapper">
      <div className="tag-input-container">
        {tags.map((tag, i) => (
          <span key={i} className="tag-item">
            {tag}
            <button type="button" onClick={() => removeTag(i)} className="tag-remove">×</button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="tag-text-input"
        />
      </div>
    </div>
  );
}
