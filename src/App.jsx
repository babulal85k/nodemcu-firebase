import { useState } from "react";
import Login from "./component/Login";
import SensorData from "./component/SensorData";

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <div>
      {user ? <SensorData /> : <Login setUser={setUser} />}
    </div>
  );
};

export default App;
