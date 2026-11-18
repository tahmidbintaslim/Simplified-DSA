import { icon } from '../src/utils/icons.js';

// The site's authored SVG icons (decorative; the label beside them names the action).
export default function Icon({ name }) {
  return <span className="icon-wrap" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: icon(name) }} />;
}
