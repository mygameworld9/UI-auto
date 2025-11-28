
import React, { createContext, useContext } from 'react';

interface EditorContextType {
  isEditing: boolean;
  selectedPath: string | null;
  onSelect: (path: string) => void;
}

const EditorContext = createContext<EditorContextType>({
  isEditing: false,
  selectedPath: null,
  onSelect: () => {},
});

export const EditorProvider = EditorContext.Provider;

export const useEditor = () => useContext(EditorContext);
