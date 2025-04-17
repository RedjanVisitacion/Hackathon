function runCode() {
    const code = document.getElementById('javaCode').value;
    const output = document.getElementById('output');
    output.textContent = 'Compiling...\n';
  
    const classMatch = /class\s+(\w+)/.exec(code);
    const hasClass = classMatch !== null;
    const hasMain = /public\s+static\s+void\s+main\s*\(.*\)/.test(code);
    const hasPrint = /System\.out\.println\s*\(.*\);/.test(code);
    const missingSemicolon = /System\.out\.println\s*\(.*\)(?!;)/.test(code);
  
    // Simulate execution
    const simulateExecution = () => {
      let simulatedOutput = '';
  
      // Simulate basic System.out.println()
      const allPrints = [...code.matchAll(/System\.out\.println\s*\((.*?)\);/g)];
      allPrints.forEach(match => {
        let content = match[1].trim();
  
        // Remove quotes and handle basic variable/concat (fake simulate)
        if (content.startsWith('"') && content.endsWith('"')) {
          simulatedOutput += content.slice(1, -1) + '\n';
        } else if (content.includes('+')) {
          let parts = content.split('+').map(p => p.trim().replace(/^"|"$/g, ''));
          let line = parts.map(p => (p === 'i' ? '0' : p)).join('');
          simulatedOutput += line + '\n';
        } else {
          simulatedOutput += '[output simulation error]\n';
        }
      });
  
      // Simulate basic for loop output (assume 3 loops for demo)
      const forLoops = [...code.matchAll(/for\s*\((.*?)\)\s*\{([\s\S]*?)\}/g)];
      forLoops.forEach(loop => {
        const body = loop[2];
  
        const printsInLoop = [...body.matchAll(/System\.out\.println\s*\((.*?)\);/g)];
        for (let i = 0; i < 3; i++) {  // simulate 3 iterations
          printsInLoop.forEach(match => {
            let content = match[1].trim();
            if (content.includes('+')) {
              let parts = content.split('+').map(p => p.trim().replace(/^"|"$/g, ''));
              let line = parts.map(p => (p === 'i' ? i : p)).join('');
              simulatedOutput += line + '\n';
            } else {
              simulatedOutput += content.replace(/^"|"$/g, '') + '\n';
            }
          });
        }
      });
  
      return simulatedOutput;
    };
  
    // Simulate compile & execution
    setTimeout(() => {
      if (hasClass && hasMain && hasPrint && !missingSemicolon) {
        const finalOutput = simulateExecution();
        output.textContent += `\n${finalOutput}\nProgram finished with exit code 0.`;
      } else {
        output.textContent += '\n[Error] Compilation failed:\n';
        if (!hasClass) output.textContent += '- ❌ Missing class definition\n';
        if (!hasMain) output.textContent += '- ❌ Missing main method\n';
        if (!hasPrint) output.textContent += '- ❌ Missing or incorrect System.out.println(...);\n';
        if (missingSemicolon) output.textContent += '- ❌ Missing semicolon at end of print statement\n';
      }
    }, 1000);
  }
  
  function clearOutput() {
    document.getElementById('output').textContent = '';
  }
  