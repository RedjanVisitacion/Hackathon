function runCode() {
    const code = document.getElementById('javaCode').value;
    const output = document.getElementById('output');
    output.textContent = 'Compiling...\n';

    // Basic pattern checks
    const hasClass = /class\s+HelloWorld/.test(code);
    const hasMain = /public\s+static\s+void\s+main\s*\(.*\)/.test(code);
    const hasPrint = /System\.out\.println\(".*"\);/.test(code);
    const missingSemicolon = /System\.out\.println\(".*"\)(?!;)/.test(code);

    setTimeout(() => {
      if (hasClass && hasMain && hasPrint && !missingSemicolon) {
        const match = code.match(/System\.out\.println\("(.*?)"\);/);
        const printedText = match ? match[1] : "No output";
        output.textContent += `\n${printedText}\n\nProgram finished with exit code 0.`;
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
    document.getElementById('output').textContent = '';
  }