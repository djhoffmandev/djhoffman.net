
import './App.css';

import React from 'react';
// Importing Markdoc as specified by https://markdoc.io/docs/getting-started
import Markdoc from '@markdoc/markdoc';

function App() {

  // The content starts out empty, because we have to fetch the markdown file. Use this state to track when we've fetched the markdown.
  const [content, setContent] = React.useState(null);
  const [headings, setHeadings] = React.useState(null);
  
  // Use the 'page' search paramaters for internal linking. For example, https://$SITENAME.onrender.com?page=page1.md will get the contents of public/page1.md
  const urlsearch = new URL(window.location.href).search;
  const page = new URLSearchParams(urlsearch).get("page") || 'index.md'; // index.md is the default
  
  React.useEffect(() => {
    // Need to use process.env.PUBLIC_URL because the public url isn't always public/ when productionized via `yarn build`.
    fetch(process.env.PUBLIC_URL + '/' + page).then(r => r.text()).then(t => {

      // The parse, transform, render steps from https://markdoc.io/docs/getting-started#use-markdoc
      const ast = Markdoc.parse(t);
      const transformedContent = Markdoc.transform(ast);

      // We render react here though, not html.
      const react = Markdoc.renderers.react(transformedContent, React);
      setContent(react);
    });
  }, [page]) // page here is what this block depends on. If it ever changed, this block would get re-run.
  
  // Render a loading screen while waiting to fetch the markdown file.
  if (!content) {
    return <p>Loading...</p>
  }
  return content;
}

export default App;
