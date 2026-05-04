import React, { useMemo, useState } from 'react';

const cleanHtmlContent = (html) => {
  if (!html || typeof window === 'undefined') return html || '';

  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  doc.querySelectorAll('span.ql-ui').forEach((element) => element.remove());

  const orderedLists = doc.querySelectorAll('ol');
  orderedLists.forEach((orderedList) => {
    const hasBullet = Array.from(orderedList.children).some(
      (listItem) => listItem.getAttribute('data-list') === 'bullet'
    );

    if (hasBullet) {
      const unorderedList = doc.createElement('ul');
      Array.from(orderedList.children).forEach((listItem) => {
        unorderedList.appendChild(listItem.cloneNode(true));
      });
      orderedList.replaceWith(unorderedList);
    }
  });

  return doc.body.innerHTML;
};

const HtmlContent = ({ html }) => {
  const cleanedHtml = useMemo(() => cleanHtmlContent(html), [html]);

  return (
    <>
      <style>{`
        .entity-translation-html {
          color: #515B6F;
          font-family: Poppins, sans-serif;
          font-weight: 400;
          font-size: 16px;
          line-height: 1.7;
        }

        .entity-translation-html p {
          margin: 0 0 14px;
        }

        .entity-translation-html p:last-child {
          margin-bottom: 0;
        }

        .entity-translation-html ol,
        .entity-translation-html ul {
          margin: 0 0 14px;
          padding-inline-start: 24px;
        }

        .entity-translation-html ol {
          list-style-type: decimal;
        }

        .entity-translation-html ul {
          list-style-type: disc;
        }

        .entity-translation-html li {
          margin-bottom: 8px;
          padding-inline-start: 4px;
        }

        .entity-translation-html li:last-child {
          margin-bottom: 0;
        }

        .entity-translation-html strong {
          color: #232323;
          font-weight: 700;
        }

        .entity-translation-html a {
          color: #1677ff;
          text-decoration: underline;
        }
      `}</style>
      <div
        className="entity-translation-html"
        dangerouslySetInnerHTML={{ __html: cleanedHtml }}
      />
    </>
  );
};

const EntityTranslationContent = ({ title, content, collapsible = true }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!content) return null;

  if (!collapsible) {
    return (
      <div
        style={{
          color: '#515B6F',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: 1.7,
        }}
      >
        <HtmlContent html={content} />
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: '8px',
        marginBottom: '10px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '10px 20px',
          background: '#E0EAFC4D',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onClick={() => setIsOpen((current) => !current)}
      >
        <h3
          style={{
            fontFamily: 'Poppins, sans-serif',
            color: '#232323',
            fontSize: '16px',
            fontWeight: 500,
            margin: 0,
          }}
        >
          {title}
        </h3>
        <span
          style={{
            fontSize: '18px',
            transition: 'transform 0.3s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            display: 'inline-flex',
          }}
        >
          <img src="/assets/images/arrow-down.svg" alt="" />
        </span>
      </div>

      {isOpen && (
        <div style={{ padding: '10px 20px' }}>
          <HtmlContent html={content} />
        </div>
      )}
    </div>
  );
};

export default EntityTranslationContent;
