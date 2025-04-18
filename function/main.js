function runCode() {
    const code = document.getElementById('javaCode').value;
    const output = document.getElementById('output');
    output.textContent = 'Compiling...\n';

    const variables = {};
    const arrays = {};
    const lines = code.split('\n').map(line => line.trim());

    const hasClass = /class\s+\w+/.test(code);
    const hasMain = /public\s+static\s+void\s+main\s*\(.*\)/.test(code);
    const hasPrint = /System\.out\.(print|println)\s*\(.*\);/.test(code);
    const missingSemicolon = /System\.out\.(print|println)\s*\(.*\)(?!;)/.test(code);

    const safeEval = (expression) => {
        try {
            const replaced = expression.replace(/\b\w+\b/g, v => {
                if (variables[v] !== undefined) return variables[v];
                return v;
            });
            return eval(replaced);
        } catch {
            return '[undefined]';
        }
    };

    const resolvePrintContent = (content) => {
        const arrayAccessMatch = content.match(/(\w+)\[(.*?)\]/);
        if (arrayAccessMatch) {
            const [, arrayName, indexExpr] = arrayAccessMatch;
            const index = safeEval(indexExpr);
            return arrays[arrayName]?.[index] ?? '[undefined]';
        } else if (content.startsWith('"') && content.endsWith('"')) {
            return content.slice(1, -1);
        } else if (content.includes('+')) {
            return content.split('+').map(part => {
                part = part.trim();
                if (part.startsWith('"') && part.endsWith('"')) {
                    return part.slice(1, -1);
                } else {
                    return variables[part] !== undefined ? variables[part] : '[undefined]';
                }
            }).join('');
        } else {
            return variables[content] ?? '[undefined]';
        }
    };

    const simulateExecution = () => {
        let outputBuffer = '';
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            // Handle Array Declaration
            const arrayMatch = line.match(/String\[\]\s+(\w+)\s*=\s*\{(.*)\};/);
            if (arrayMatch) {
                const [, name, values] = arrayMatch;
                arrays[name] = values.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                i++;
                continue;
            }

            // Handle Variable Declaration
            const varMatch = line.match(/(int|boolean|String)\s+(\w+)\s*=\s*(.*);/);
            if (varMatch) {
                const [, type, name, valueRaw] = varMatch;
                let value = valueRaw.trim();
                if (type === 'int') {
                    variables[name] = safeEval(value);
                } else if (type === 'boolean') {
                    variables[name] = value === 'true';
                } else if (type === 'String') {
                    const match = value.match(/^"(.*)"$/);
                    variables[name] = match ? match[1] : value;
                }
                i++;
                continue;
            }

            // Handle For Loop
            const forMatch = line.match(/for\s*\(int\s+(\w+)\s*=\s*(-?\d+);\s*\1\s*([<>]=?)\s*(-?\d+);\s*\1(\+\+|--)\)/);
            if (forMatch) {
                const [, loopVar, startStr, operator, endStr, step] = forMatch;
                const start = parseInt(startStr);
                const end = parseInt(endStr);
                const isIncrement = step === '++';
                const compare = {
                    '<': (a, b) => a < b,
                    '<=': (a, b) => a <= b,
                    '>': (a, b) => a > b,
                    '>=': (a, b) => a >= b
                }[operator];

                i++;
                const loopBody = [];
                if (lines[i] === '{') i++;
                while (lines[i] !== '}' && i < lines.length) {
                    loopBody.push(lines[i]);
                    i++;
                }
                if (lines[i] === '}') i++;

                for (let j = start; compare(j, end); isIncrement ? j++ : j--) {
                    variables[loopVar] = j;
                    for (const bodyLine of loopBody) {
                        const printMatch = bodyLine.match(/System\.out\.(print|println)\s*\((.*?)\);/);
                        if (printMatch) {
                            const [, type, contentRaw] = printMatch;
                            const content = contentRaw.trim();
                            const outputPart = resolvePrintContent(content);
                            outputBuffer += outputPart;
                            if (type === 'println') outputBuffer += '\n';
                        }
                    }
                }
                continue;
            }

            // Handle Print Statements outside loop
            const printMatch = line.match(/System\.out\.(print|println)\s*\((.*?)\);/);
            if (printMatch) {
                const [, type, contentRaw] = printMatch;
                const content = contentRaw.trim();
                const outputPart = resolvePrintContent(content);
                outputBuffer += outputPart;
                if (type === 'println') outputBuffer += '\n';
            }

            i++;
        }

        return outputBuffer;
    };

    setTimeout(() => {
        if (hasClass && hasMain && hasPrint && !missingSemicolon) {
            const finalOutput = simulateExecution();
            output.textContent = `\n${finalOutput}\nProgram finished with exit code 0.`;
        } else {
            output.textContent = '\n[Error] Compilation failed:\n';
            if (!hasClass) output.textContent += '- ❌ Missing class definition\n';
            if (!hasMain) output.textContent += '- ❌ Missing main method\n';
            if (!hasPrint) output.textContent += '- ❌ Missing or incorrect System.out.print/println(...)\n';
            if (missingSemicolon) output.textContent += '- ❌ Missing semicolon at end of print statement\n';
        }
    }, 1000);
}

function clearOutput() {
    document.getElementById('output').textContent = '';
}
