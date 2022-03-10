import { JSX, PropsWithChildren } from 'solid-js';

export interface HTMLStencilElement extends HTMLElement {
  componentOnReady(): Promise<this>;
}

// https://stackoverflow.com/questions/63116039/camelcase-to-kebab-case
const camelToKebabCase = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

export function createSolidComponent<PropType, ElementType extends HTMLStencilElement>(
  tag: string,
) {
  return (props: PropsWithChildren<PropType & JSX.HTMLAttributes<ElementType>>): ElementType => {
    const node = document.createElement(tag);
    for (const key in props) {
      if (key === 'children') {
        const children = Array.isArray(props[key]) ? props[key] : [props[key]];
        (children as any[]).forEach((child) => {
          if (child instanceof HTMLElement) {
            node.appendChild(child);
          } else {
            node.innerHTML = child;
          }
        });
      } else if (Object.prototype.hasOwnProperty.call(props, key)) {
        const kebabKey: string = camelToKebabCase(key);
        if (
          typeof (props as Record<string, unknown>)[key] === 'string' ||
          typeof (props as Record<string, unknown>)[key] === 'number' ||
          typeof (props as Record<string, unknown>)[key] === 'boolean'
        ) {
          node.setAttribute(kebabKey, (props as Record<string, any>)[key]);
        } else {
          (node as Record<string, any>)[kebabKey] = (props as Record<string, any>)[key];
        }
      }
    }
    return node as ElementType;
  };
}
