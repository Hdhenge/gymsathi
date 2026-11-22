import { useState } from "react";


function StyleGuide() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-6 space-y-8">

      <h1 className="text-2xl font-bold">Style Guide</h1>

      {/* Buttons */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Buttons</h2>
       
      </section>

      {/* Cards */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Cards</h2>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Inputs</h2>
      </section>

      {/* State Example */}
      <section>
        <h2 className="text-xl font-semibold mb-2">State Test</h2>
        <p>Count: {count}</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white"
          onClick={() => setCount(count + 1)}
        >
          Increment
        </button>
      </section>

    </div>
  );
}

export default StyleGuide;