import { useEffect } from "react";
import { Editor } from "./Editor";

function App() {
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as Element;
      if (!target.closest("[data-focus-allowed]")) {
        (e.relatedTarget as HTMLElement)?.focus();
      }
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, []);
  // const [name, setName] = useState<string>("");
  // const [result, setResult] = useState<string>(
  //   "Please enter your name below 👇",
  // );
  // const [time, setTime] = useState<string>("Listening for Time event...");
  //
  // const doGreet = () => {
  //   let localName = name;
  //   if (!localName) {
  //     localName = "anonymous";
  //   }
  //   GreetService.Greet(localName)
  //     .then((resultValue: string) => {
  //       setResult(resultValue);
  //     })
  //     .catch((err: any) => {
  //       console.log(err);
  //     });
  // };
  //
  // useEffect(() => {
  //   Events.On("time", (timeValue: any) => {});
  //   // Reload WML so it picks up the wml tags
  //   WML.Reload();
  // }, []);

  return <Editor initialValue="" onChange={(val) => console.log(val)} />;
}

export default App;
