// schema/Callout.markdoc.js

module.exports = {
    render: 'Callout',
    description: 'Display the enclosed content in a callout box',
    children: ['paragraph', 'tag', 'list'],
    attributes: {
      type: {
        type: String,
        default: 'note',
        matches: ['check', 'error', 'note', 'warning']
      }
    }
  };