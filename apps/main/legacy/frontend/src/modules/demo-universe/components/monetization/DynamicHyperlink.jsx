/**
 * DynamicHyperlink.jsx - Content-Aware Ad Hook System
 * Analyzes page content and converts key terms into clickable ad-hooks
 * Re-initializes when content changes
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';

// Default keywords to hyperlink (can be extended via props)
const DEFAULT_KEYWORDS = [
  'coconut oil', 'MCTs', 'medium-chain triglycerides', 'virgin coconut oil',
  'weight gain', 'metabolism', 'fat oxidation', 'nutrition', 'wellness',
  'organic', 'cold pressed', 'health benefits', 'dietary fat'
];

// Keyword analysis using simple NLP-like approach
const analyzeContent = (text, additionalKeywords = []) => {
  const allKeywords = [...DEFAULT_KEYWORDS, ...additionalKeywords];
  const foundKeywords = [];
  const lowerText = text.toLowerCase();
  
  allKeywords.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    if (lowerText.includes(lowerKeyword)) {
      // Find all occurrences
      let index = lowerText.indexOf(lowerKeyword);
      while (index !== -1) {
        foundKeywords.push({
          keyword,
          index,
          length: keyword.length
        });
        index = lowerText.indexOf(lowerKeyword, index + 1);
      }
    }
  });
  
  // Sort by index and remove overlapping keywords
  foundKeywords.sort((a, b) => a.index - b.index);
  const filtered = [];
  let lastEnd = -1;
  
  foundKeywords.forEach(kw => {
    if (kw.index >= lastEnd) {
      filtered.push(kw);
      lastEnd = kw.index + kw.length;
    }
  });
  
  return filtered;
};

// Create hyperlinked content
const createHyperlinkedContent = (text, keywords, onKeywordClick) => {
  if (!keywords || keywords.length === 0) {
    return text;
  }
  
  const parts = [];
  let lastIndex = 0;
  
  keywords.forEach((kw, i) => {
    // Add text before keyword
    if (kw.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, kw.index),
        key: `text-${i}`
      });
    }
    
    // Add hyperlinked keyword
    const actualText = text.substring(kw.index, kw.index + kw.length);
    parts.push({
      type: 'link',
      content: actualText,
      keyword: kw.keyword,
      key: `link-${i}`
    });
    
    lastIndex = kw.index + kw.length;
  });
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
      key: `text-final`
    });
  }
  
  return parts.map(part => {
    if (part.type === 'link') {
      return (
        <motion.button
          key={part.key}
          onClick={(e) => {
            e.preventDefault();
            onKeywordClick?.(part.keyword);
          }}
          className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer transition-colors font-medium"
          whileHover={{ scale: 1.02 }}
          data-testid={`hyperlink-${part.keyword.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {part.content}
        </motion.button>
      );
    }
    return <span key={part.key}>{part.content}</span>;
  });
};

// DynamicHyperlink Component
const DynamicHyperlink = ({ 
  children, 
  additionalKeywords = [],
  onKeywordClick,
  className = ''
}) => {
  const [processedContent, setProcessedContent] = useState(null);
  const [contentHash, setContentHash] = useState('');
  
  // Extract text content from children
  const textContent = useMemo(() => {
    if (typeof children === 'string') {
      return children;
    }
    // Handle complex children structures
    const extractText = (node) => {
      if (typeof node === 'string') return node;
      if (Array.isArray(node)) return node.map(extractText).join('');
      if (node?.props?.children) return extractText(node.props.children);
      return '';
    };
    return extractText(children);
  }, [children]);
  
  // Create hash of content for change detection
  useEffect(() => {
    const hash = textContent.substring(0, 100) + textContent.length;
    if (hash !== contentHash) {
      setContentHash(hash);
      
      // Analyze and process content
      const keywords = analyzeContent(textContent, additionalKeywords);
      
      if (typeof children === 'string') {
        setProcessedContent(createHyperlinkedContent(textContent, keywords, onKeywordClick));
      } else {
        // For non-string children, we need more complex handling
        // For now, just pass through
        setProcessedContent(children);
      }
    }
  }, [textContent, contentHash, additionalKeywords, onKeywordClick, children]);
  
  return (
    <span className={className}>
      {processedContent || children}
    </span>
  );
};

// Higher-order component for wrapping paragraphs with dynamic hyperlinks
export const withDynamicHyperlinks = (WrappedComponent) => {
  return function WithDynamicHyperlinks({ content, onKeywordClick, ...props }) {
    return (
      <WrappedComponent {...props}>
        <DynamicHyperlink onKeywordClick={onKeywordClick}>
          {content}
        </DynamicHyperlink>
      </WrappedComponent>
    );
  };
};

// Hook for analyzing content and getting keywords
export const useContentAnalysis = (content, additionalKeywords = []) => {
  const [keywords, setKeywords] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  useEffect(() => {
    if (!content) return;
    
    setIsAnalyzing(true);
    
    // Simulate async analysis (in production could be API call)
    const timer = setTimeout(() => {
      const found = analyzeContent(content, additionalKeywords);
      setKeywords([...new Set(found.map(k => k.keyword))]);
      setIsAnalyzing(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [content, additionalKeywords]);
  
  return { keywords, isAnalyzing };
};

// Utility to render text with hyperlinks
export const renderWithHyperlinks = (text, onKeywordClick, additionalKeywords = []) => {
  const keywords = analyzeContent(text, additionalKeywords);
  return createHyperlinkedContent(text, keywords, onKeywordClick);
};

export default DynamicHyperlink;
