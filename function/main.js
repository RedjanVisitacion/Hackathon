function runCode() {
    const code = document.getElementById('javaCode').value;
    const output = document.getElementById('output');
    output.textContent = 'Compiling...\n';

    const variables = {};
    const lines = code.split('\n').map(line => line.trim());

    const hasClass = /class\s+\w+/.test(code);
    const hasMain = /public\s+static\s+void\s+main\s*\(.*\)/.test(code);
    const hasPrint = /System\.out\.(print|println)\s*\(.*\);/.test(code);
    const missingSemicolon = /System\.out\.(print|println)\s*\(.*\)(?!;)/.test(code);

    const simulateExecution = () => {
        let outputBuffer = '';
        let i = 0;

        while (i < lines.length) {
            let line = lines[i];

            // Variable Declaration
            const varMatch = line.match(/(int|boolean|String)\s+(\w+)\s*=\s*(.*);/);
            if (varMatch) {
                let [, type, name, value] = varMatch;
                value = value.trim();

                try {
                    if (type === 'int') {
                        const replaced = value.replace(/\b\w+\b/g, v => variables[v] !== undefined ? variables[v] : v);
                        variables[name] = eval(replaced);
                    } else if (type === 'boolean') {
                        variables[name] = value === 'true';
                    } else if (type === 'String') {
                        const strMatch = value.match(/^"(.*)"$/);
                        variables[name] = strMatch ? strMatch[1] : value;
                    }
                } catch (e) {
                    variables[name] = NaN;
                }
                i++;
                continue;
            }

            // If Statement
            const ifMatch = line.match(/if\s*\((.+)\)/);
            if (ifMatch) {
                let condition = ifMatch[1].trim();
                let conditionValue = false;
                try {
                    const replaced = condition.replace(/\b\w+\b/g, v => variables[v] !== undefined ? JSON.stringify(variables[v]) : v);
                    conditionValue = eval(replaced);
                } catch (e) {
                    outputBuffer += '[Error] Invalid condition in if-statement\n';
                }

                if (!conditionValue) {
                    if (lines[i + 1]?.includes('{')) {
                        i++;
                        while (!lines[i]?.includes('}')) i++;
                    } else {
                        i++;
                    }
                }
                i++;
                continue;
            }

            // For Loop (correct handling for iteration)
            const forMatch = line.match(/for\s*\(int\s+(\w+)\s*=\s*(-?\d+);\s*\1\s*([<>]=?)\s*(-?\d+);\s*\1(\+\+|--)+\)/);
            if (forMatch) {
                let [, loopVar, start, operator, end, step] = forMatch;
                start = parseInt(start);
                end = parseInt(end);
                const isIncrement = step === '++';
                const comparator = {
                    '<': (a, b) => a < b,
                    '<=': (a, b) => a <= b,
                    '>': (a, b) => a > b,
                    '>=': (a, b) => a >= b
                }[operator];

                let loopBody = [];
                i++;
                if (lines[i] === '{') i++;
                while (lines[i] !== '}') {
                    loopBody.push(lines[i]);
                    i++;
                }

                for (let j = start; comparator(j, end); isIncrement ? j++ : j--) {
                    variables[loopVar] = j;
                    loopBody.forEach(bodyLine => {
                        const printMatch = bodyLine.match(/System\.out\.(print|println)\s*\((.*?)\);/);
                        if (printMatch) {
                            const [, type, rawContent] = printMatch;
                            const content = rawContent.trim();
                            let outputPart = '';

                            if (content.startsWith('"') && content.endsWith('"')) {
                                outputPart = content.slice(1, -1);
                            } else if (content.includes('+')) {
                                const parts = content.split('+').map(p => p.trim());
                                outputPart = parts.map(part => {
                                    if (part.startsWith('"') && part.endsWith('"')) {
                                        return part.slice(1, -1);
                                    } else {
                                        return variables[part] !== undefined ? variables[part] : '[undefined]';
                                    }
                                }).join(' ');
                            } else {
                                outputPart = variables[content] !== undefined ? variables[content] : '[undefined]';
                            }

                            outputBuffer += outputPart;
                            if (type === 'println') outputBuffer += '\n';
                        }
                    });
                }

                i++; // skip closing brace
                continue;
            }

            // Print / Println outside loop
            const printMatch = line.match(/System\.out\.(print|println)\s*\((.*?)\);/);
            if (printMatch) {
                const [, type, rawContent] = printMatch;
                const content = rawContent.trim();
                let outputPart = '';

                if (content.startsWith('"') && content.endsWith('"')) {
                    outputPart = content.slice(1, -1);
                } else if (content.includes('+')) {
                    const parts = content.split('+').map(p => p.trim());
                    outputPart = parts.map(part => {
                        if (part.startsWith('"') && part.endsWith('"')) {
                            return part.slice(1, -1);
                        } else {
                            return variables[part] !== undefined ? variables[part] : '[undefined]';
                        }
                    }).join(' ');
                } else {
                    outputPart = variables[content] !== undefined ? variables[content] : '[undefined]';
                }

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
            output.textContent += `\n${finalOutput}\nProgram finished with exit code 0.`;
        } else {
            output.textContent += '\n[Error] Compilation failed:\n';
            if (!hasClass) output.textContent += '- ❌ Missing class definition\n';
            if (!hasMain) output.textContent += '- ❌ Missing main method\n';
            if (!hasPrint) output.textContent += '- ❌ Missing or incorrect System.out.print/println(...);\n';
            if (missingSemicolon) output.textContent += '- ❌ Missing semicolon at end of print statement\n';
        }
    }, 1000);
}

function clearOutput() {
    document.getElementById('output').textContent = '';
}
