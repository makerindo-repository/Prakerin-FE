//css unable to be read before in the layout.tsx, explicitly defining it
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}