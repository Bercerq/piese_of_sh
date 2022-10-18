import { useEffect } from "react";

const DocumentTitle = (props: { title: string }) => {
  useEffect(() => { document.title = `Opt Out Advertising | ${props.title}`; }, []);
  return null;
}
export default DocumentTitle;