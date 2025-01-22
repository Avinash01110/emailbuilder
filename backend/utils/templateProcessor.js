
const processTemplate = (template) => {
  try {
    const { title, content, images } = template;
   
    const processedContent = content.map(section => {
      const styles = section.styles ? 
        Object.entries(section.styles)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
          .join('; ') 
        : '';

      if (section.type === 'text') {
        return `<div style="${styles}">${section.content || ''}</div>`;
      } 
      // else if (section.type === 'image' && section.content) {
      //   return `<img src="${section.content}" alt="Email content" style="max-width: 100%; ${styles}">`;
      // }
      return '';
    }).join('\n');

    
    let html = template.layout;
    html = html.replace('{{maintitle}}', title || '');
    html = html.replace('{{title}}', title || '');
    html = html.replace('{{content}}', processedContent || '');
    
   
    const imagesHtml = images?.length 
      ? images.map(img => `<img src="${img}" alt="Email content" style="max-width: 100%;">`).join('\n')
      : '';
    html = html.replace('{{#each images}}{{/each}}', imagesHtml);

    return html;
  } catch (error) {
    console.error('Error processing template:', error);
    throw new Error('Failed to process template');
  }
};

export default processTemplate;