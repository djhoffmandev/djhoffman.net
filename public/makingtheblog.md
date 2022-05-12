# Making a Static Site Blog
Source Code for this post: [makingtheblog.md](https://github.com/djhoffmandev/djhoffman.net/blob/main/public/makingtheblog.md)

My goal as a writer is generally to lower the barrier to entry for my writing practices, while not making something that looks like shit.
While I don't always accomplish the latter, I've found that I personally work best with a simple markup language like Markdown.

So when Stripe announced [Markdoc.io](https://markdoc.io), I knew I had to try using it to build a personal blog.

- **Note**: Markdoc is capable of much more interesting formatting and prettiness than what I've used here. I'm using it for just displaying markdown, but please check out it's docs for all the further stylistic choices you can make with Markdoc.
## Results
At the end of this tutorial you will have:
- a React static site (i.e., files are served from storage, no server compute used), served via [Render](Render.com)
- with an index.md rendered via Markdoc
- a [GitHub](GitHub.com) repo hosting all of this
- new commits to the GitHub repo will update the static site in around 5 minutes (but you can iterate on your local machine in seconds)

## Prerequisites
You will need:
- A GitHub account
- Some way to run npm and yarn locally.
- Working knowledge of how to use Git and GitHub. I generally won't be explaining what Git commands do.

## Setting up a site with Render

### Conventions in this text
Code typeset in codeblock like that below is intended to be safe to copy-paste into your shell. I try to explain what's going on, but you could do most of this tutorial copy-pasting the code blocks.
```
echo "this is copy-pasteable"
```

There's several places throughout where you'll need a name for this repo/app/site. I'll use the word $SITENAME where this goes in various scripts. I ran 
```
export SITENAME=markdoc-tutorial-app
```
to make all of this scriptable via copy-paste. Substitute the name of your repo/site/app appropriately.

For some git commands to work, you'll also need to do the same for your Github username.
```
export $GITHUBUSER=djhoffmandev
```


### Making a local react app
We need a place for your code to go. Make a GitHub repo. Call it `$SITENAME`.

To start, we use [create-react-app](https://create-react-app.dev/docs/getting-started/) to build our scaffolding.
```
npx create-react-app $SITENAME
cd $SITENAME
npm start
```
This last line will start a server on your local machine and open up a browser window to [localhost:3000](localhost:3000). If you have a rotating React logo then it's working correctly.

Now we need to connect this folder to your Github repository. `create-react-app` actually made the folder a git repository already. We're going to swap the primary branch to `main` and add the GitHub repo as a remote, then push the changes to GitHub.
```
git remote add origin git@github.com:$GITHUBUSER/$SITENAME.git
git branch -M main
git push -u origin main
```

### Connecting the repo to Render {% #conn %}
Okay, I'm cheating slightly, Render has great docs on [setting up a static site](https://render.com/docs/deploy-create-react-app) that taught me how to do this. Go to your [Render Dashboard](https://dashboard.render.com/), use the blue "New" button to create a static site and connect up your GitHub account to Render. Then select your repo from the list.

Since we're using `create-react-app` your build command will be `yarn build`, and the publish directory will be `build`. This is the step where all your artisanal, hand-crafted, code with all those lovely comments you wrote gets turned into gobbledygook so that it's smaller and therefore cheaper to send across the internet.

Render's dashboard will then start a build and deploy of your repo, you can follow along in the logs to see the progress of `yarn build`. For me, this process takes about 5 minutes until the site is ready. Render will also give you a link to something like [https://$SITENAME.onrender.com]() that's now hosting the default app.

Once you're satisfied that your GitHub repo is properly wired into Render, let's iterate by adding Markdoc.

## Adding Markdoc to the site
Now, we're going to be following a heavily edited version of the [Markdoc tutorial for React](https://markdoc.io/docs/examples/react). Notably, I'll be skipping the schema validation and server-side code completely, my goal here is to get running as quickly as possible.

You'll note that Markdoc also recommends using `create-react-app`, it's nice when tools agree with each other in their getting started docs.

While you used npm to run create-react-app, the resulting app uses yarn for package management. Run
```
yarn add @markdoc/markdoc
```
in your site repo. Next, open up `src/App.js`. This is the content of App.js that I used. I encourage you to copy-paste it into your code, and I'm going to walk you through it.
```
import './App.css';

import React from 'react';
// Importing Markdoc as specified by https://markdoc.io/docs/getting-started
import Markdoc from '@markdoc/markdoc';


function App() {

  // The content starts out empty, because we have to fetch the markdown file. Use this state to track when we've fetched the markdown.
  const [content, setContent] = React.useState(null);
  
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
  return (
    content
  );
}

export default App;
```
In addition create a markdown file at `public/index.md` and put some markdown in it. [localhost:3000](localhost:3000) should now have your markdown rendered. 

At this point, I recommend running
```
yarn start
```
to open up your browser window with this code running.

### React code walkthrough
What this code does is look at the url of the page being loaded, look at the search parameter 'page', and render that markdown file to the user. Any reasonable site, even a blog, has links among different pages. This is how I chose to implement links. A link in markdown written as `[page1](?page=page1.md)` links to the file `public/page1.md` in my site repo. Like so [page1](?page=page1.md).

Unfortunately, in Javascript, even fetching a "local" file is an asynchronous call. So this page needs to handle two states of the world, before the markdown page is loaded, and after it's loaded (a better coded page would also handle if there was an error in fetching the markdown file).

Conceptually, `const [content, setContent] = React.useState(null);` represents this. `content` being either null when the markdown hasn't been loaded, or a non-null value containing the React node that should get rendered representing that markdown file if it has been found. `setContent` is a special function generated by react to change the value of `content`, direct assignment to state in React is not compatible with the framework (see the [official docs on state](https://reactjs.org/docs/state-and-lifecycle.html)). 

Now, when the state of a function in React changes, it typically causes that bit of the webpage to re-render. Consider the following definition of the App function:
```
function App() {

  // The content starts out empty, because we have to fetch the markdown file. Use this state to track when we've fetched the markdown.
  const [content, setContent] = React.useState(null);
  
  // Use the 'page' search paramaters for internal linking. For example, https://$SITENAME.onrender.com?page=page1.md will get the contents of public/page1.md
  const urlsearch = new URL(window.location.href).search;
  const page = new URLSearchParams(urlsearch).get("page") || 'index.md'; // index.md is the default
  
 
    // Need to use process.env.PUBLIC_URL because the public url isn't always public/ when productionized via `yarn build`.
    fetch(process.env.PUBLIC_URL + '/' + page).then(r => r.text()).then(t => {

        // The parse, transform, render steps from https://markdoc.io/docs/getting-started#use-markdoc
        const ast = Markdoc.parse(t);
        const transformedContent = Markdoc.transform(ast);
        // We render react here though, not html.
        const react = Markdoc.renderers.react(transformedContent, React);
        setContent(react);
    });
 
  
  // Render a loading screen while waiting to fetch the markdown file.
  if (!content) {
    return <p>Loading...</p>
  }
  return (
    content
  );
}

export default App;
```
If you try to use this as your definition of App.js, your browser will continuously query for index.md. This is because setContent will change the state of the App function (which is really a React component), and that state change causes the App function to get called again, which kicks off the fetch again, ad infinitum.

`useEffect` is React's way of implementing side-effects. It's like saying, "when you run the App function, also do this on the side". The way this breaks infinite loops is by explicitly declaring the dependencies of the effect. So the contents of this useEffect hook only get run when `page` changes. Because the code in the effect doesn't change `page` (it only changes content) there's no infinite loop. 

Now that we've set up App.js, you can write Markdoc to your heart's content. Here's some example pages to get started:

#### public/index.md
```
# Welcome to my Blog!
I hope you have a **very** good time here.

## Index
[blog 1](?page=blog1.md)
```

#### public/blog1.md
```
# First Blog
This is my first blog post.
```
## Push to Github and watch Render deploy
```
git commit -am 'tutorial'; git push
```
And Render will automatically deploy your new blog.

Thanks everyone!

#### Footer
[Back to Index](?page=index.md)