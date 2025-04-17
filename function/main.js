function runCode() {
    const code = document.getElementById('javaCode').value;
    const output = document.getElementById('output');
    output.textContent = 'Compiling...\n';
  
    // Basic pattern checks
    const classMatch = /class\s+(\w+)/.exec(code);
    const hasClass = classMatch !== null; // Checks if there is a class definition
    const hasMain = /public\s+static\s+void\s+main\s*\(.*\)/.test(code);
    const hasPrint = /System\.out\.println\(".*"\);/.test(code);
    const missingSemicolon = /System\.out\.println\(".*"\)(?!;)/.test(code);
    
    // Loop matching (simple simulation of for loop execution)
    const forLoops = [...code.matchAll(/for\s*\(.*;.*;.*\)\s*\{(.*?)\}/gs)].map(match => match[1]);
  
    // Simulating loop execution and checking output
    const simulateLoops = (loops) => {
      let simulatedOutput = '';
      loops.forEach(loop => {
        // Find print statements within the loop
        const printMatches = [...loop.matchAll(/System\.out\.println\("(.*?)"\);/g)];
        const printedTexts = printMatches.map(match => match[1]);
        if (printedTexts.length > 0) {
          simulatedOutput += printedTexts.join('\n') + '\n';
        }
      });
      return simulatedOutput;
    };
  
    setTimeout(() => {
      if (hasClass && hasMain && hasPrint && !missingSemicolon) {
        // Extract all System.out.println() calls and their printed texts
        const printMatches = [...code.matchAll(/System\.out\.println\("(.*?)"\);/g)];
        const printedTexts = printMatches.map(match => match[1]);
        const outputText = printedTexts.length > 0 ? printedTexts.join('\n') : "No output";
  
        // Simulate loop execution and add the result to output
        const loopOutput = simulateLoops(forLoops);
        output.textContent = `${outputText}\n${loopOutput}\n\nProgram finished with exit code 0.`;
      } else {
        output.textContent += '\n[Error] Compilation failed:\n';
  
        if (!hasClass) output.textContent += '- ❌ Missing class definition\n';
        if (!hasMain) output.textContent += '- ❌ Missing main method\n';
        if (!hasPrint) output.textContent += '- ❌ Missing or incorrect System.out.println("...");\n';
        if (missingSemicolon) output.textContent += '- ❌ Missing semicolon at end of print statement\n';
      }
    }, 1000);
  }
  
  function clearOutput() {
    document.getElementById('output').textContent = ''; // Clear output
  }
  