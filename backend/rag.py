import os
import re
from typing import List, Dict, Any

class RagDocument:
    def __init__(self, filename: str, title: str, section: str, content: str):
        self.filename = filename
        self.title = title
        self.section = section
        self.content = content
        # Precompute search tokens
        self.tokens = self._tokenize(title + " " + section + " " + content)

    def _tokenize(self, text: str) -> set:
        # Lowercase, replace non-alphanumeric with spaces, and split
        text_clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
        tokens = set(text_clean.split())
        # Remove empty tokens
        return {t for t in tokens if len(t) > 2}

class RagSearchEngine:
    def __init__(self, docs_dir: str):
        self.docs_dir = docs_dir
        self.documents: List[RagDocument] = []
        self.load_documents()

    def load_documents(self):
        """
        Scans docs_dir, parses Markdown files, splits them by sections (## Headers),
        and loads them into the search index.
        """
        if not os.path.exists(self.docs_dir):
            os.makedirs(self.docs_dir, exist_ok=True)
            return

        for fname in os.listdir(self.docs_dir):
            if not fname.endswith(".md"):
                continue
            
            file_path = os.path.join(self.docs_dir, fname)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Title is usually the first # Header
                title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
                title = title_match.group(1) if title_match else fname.replace(".md", "").title()
                
                # Split content into sections by ## headers
                sections = re.split(r'^##\s+', content, flags=re.MULTILINE)
                
                # The first section is the header context before the first ##
                if sections[0].strip():
                    self.documents.append(RagDocument(fname, title, "Introduction", sections[0].strip()))
                
                for sec in sections[1:]:
                    lines = sec.split("\n")
                    section_title = lines[0].strip()
                    section_content = "\n".join(lines[1:]).strip()
                    if section_content:
                        self.documents.append(RagDocument(fname, title, section_title, section_content))
            except Exception as e:
                print(f"Error loading RAG doc {fname}: {e}")

    def retrieve(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        """
        Scores all document sections against the query by keyword matching.
        Returns the top_k matching document sections.
        """
        # Tokenize query
        query_clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', query.lower())
        query_tokens = [t for t in query_clean.split() if len(t) > 2]
        
        if not query_tokens or not self.documents:
            # Return some basic docs if query is empty
            return [{"title": d.title, "section": d.section, "content": d.content} for d in self.documents[:top_k]]

        scored_docs = []
        for doc in self.documents:
            # Score is based on intersection of query tokens and document tokens
            # We give higher weight to matches in the document section/title
            overlap = doc.tokens.intersection(query_tokens)
            score = len(overlap)
            
            # Boost score if query terms exist exactly in the section title or document title
            title_clean = doc.title.lower() + " " + doc.section.lower()
            for token in query_tokens:
                if token in title_clean:
                    score += 1.5
                    
            if score > 0:
                scored_docs.append((score, doc))
        
        # Sort by score descending
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        
        # Format results
        results = []
        for score, doc in scored_docs[:top_k]:
            results.append({
                "title": doc.title,
                "section": doc.section,
                "content": doc.content,
                "score": score
            })
            
        # Fallback if no matches found
        if not results and self.documents:
            results = [{"title": d.title, "section": d.section, "content": d.content, "score": 0.0} for d in self.documents[:top_k]]
            
        return results

# Singleton instance placeholder
_engine = None

def get_rag_engine(docs_dir: str = None) -> RagSearchEngine:
    global _engine
    if _engine is None:
        if docs_dir is None:
            # Resolve default path relative to main.py
            base_dir = os.path.dirname(os.path.abspath(__file__))
            docs_dir = os.path.join(base_dir, "rag_docs")
        _engine = RagSearchEngine(docs_dir)
    return _engine
