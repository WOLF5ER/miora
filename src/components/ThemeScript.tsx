export default function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem("miora-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
