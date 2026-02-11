import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Fix for Google Translate vs React "removeChild" error
// See: https://github.com/facebook/react/issues/11538
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function<T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (console) {
        console.warn('Cannot remove a child from a different parent!', child, this);
      }
      return child;
    }
    return originalRemoveChild.apply(this, [child]) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function<T extends Node>(newChild: T, refChild: Node | null): T {
    if (refChild && refChild.parentNode !== this) {
      if (console) {
        console.warn('Cannot insert before a reference node from a different parent!', newChild, refChild, this);
      }
      return newChild;
    }
    return originalInsertBefore.apply(this, [newChild, refChild]) as T;
  };
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
