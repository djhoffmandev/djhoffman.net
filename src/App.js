import './App.css';
import Markdoc from '@markdoc/markdoc';
import React from 'react';
function App() {
  // demo for react from markdown.io
  const [content, setContent] = React.useState(null);
  

  const urlsearch = new URL(window.location.href).search;
  const page = new URLSearchParams(urlsearch).get("page") || 'index.md';
  
  React.useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/' + page).then(r => r.text()).then(t => {
      const ast = Markdoc.parse(t);
      const transformedContent = Markdoc.transform(ast);
      const react = Markdoc.renderers.react(transformedContent, React);
      setContent(react);
    });
  }, [])
  
  if (!content) {
    return <p>Loading...</p>
  }
  return (
    content
  );
}

export default App;
