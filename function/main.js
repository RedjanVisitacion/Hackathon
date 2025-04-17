function runCode() {
    const code = document.getElementById('javaCode').value;
    const output = document.getElementById('output');
    output.textContent = 'Compiling...\n';
  
    const variables = {};
    const lines = code.split('\n').map(line => line.trim());
  
    const classMatch = /class\s+(\w+)/.exec(code);
    const hasClass = classMatch !== null;
    const hasMain = /public\s+static\s+void\s+main\s*\(.*\)/.test(code);
    const hasPrint = /System\.out\.println\s*\(.*\);/.test(code);
    const missingSemicolon = /System\.out\.println\s*\(.*\)(?!;)/.test(code);
  
    const simulateExecution = () => {
      let outputBuffer = '';
  
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
  
        // Variable declaration (int, boolean, String)
        const varMatch = line.match(/(int|boolean|String)\s+(\w+)\s*=\s*(.+);/);
        if (varMatch) {
          let [, type, name, value] = varMatch;
          value = value.trim();
  
          if (type === 'int') {
            variables[name] = parseInt(value);
          } else if (type === 'boolean') {
            variables[name] = value === 'true';
          } else if (type === 'String') {
            const strMatch = value.match(/^"(.*)"$/);
            variables[name] = strMatch ? strMatch[1] : value;
          }
          continue;
        }
  
        // If statement
        const ifMatch = line.match(/if\s*\((.+)\)/);
        if (ifMatch) {
          let condition = ifMatch[1].trim();
          let conditionValue = false;
          try {
            conditionValue = eval(condition.replace(/\b\w+\b/g, (v) => variables[v] !== undefined ? JSON.stringify(variables[v]) : v));
          } catch (e) {
            outputBuffer += '[Error] Invalid condition in if-statement\n';
          }
          if (!conditionValue) {
            if (lines[i + 1]?.includes('{')) {
              while (!lines[++i]?.includes('}')) {}
            } else {
              i++;
            }
          }
          continue;
        }
  
        // For loop (simple form)
        const forMatch = line.match(/for\s*\(\s*int\s+(\w+)\s*=\s*(\d+);\s*\1\s*<\s*(\d+);\s*\1\+\+\s*\)/);
        if (forMatch) {
          let [, loopVar, start, end] = forMatch;
          let k = i + 1;
          let loopBody = [];
          while (!lines[k].includes('}')) {
            loopBody.push(lines[k]);
            k++;
          }
          for (let j = parseInt(start); j < parseInt(end); j++) {
            variables[loopVar] = j;
            loopBody.forEach(bodyLine => processLine(bodyLine));
          }
          i = k;
          continue;
        }
  
        // Handle print statements
        if (line.startsWith('System.out.println')) {
          processLine(line);
        }
      }
  
      function processLine(printLine) {
        const printMatch = printLine.match(/System\.out\.println\s*\((.*?)\);/);
        if (printMatch) {
          let content = printMatch[1].trim();
          if (content.startsWith('"') && content.endsWith('"')) {
            outputBuffer += content.slice(1, -1) + '\n';
          } else if (content.includes('+')) {
            let parts = content.split('+').map(p => p.trim());
            let result = parts.map(p => {
              if (p.startsWith('"') && p.endsWith('"')) return p.slice(1, -1);
              return variables[p] !== undefined ? variables[p] : '[undefined]';
            }).join('');
            outputBuffer += result + '\n';
          } else {
            outputBuffer += (variables[content] !== undefined ? variables[content] : '[undefined]') + '\n';
          }
        }
      }
  
      return outputBuffer;
    };
  
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
  