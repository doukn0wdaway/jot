import { Editor } from "./Editor";

function App() {
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
  //   Events.On("time", (timeValue: any) => {
  //     setTime(timeValue.data);
  //   });
  //   // Reload WML so it picks up the wml tags
  //   WML.Reload();
  // }, []);

  return <Editor initialValue="" onChange={(val) => console.log(val)} />;
}

export default App;
