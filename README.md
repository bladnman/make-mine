# make-mine

A CLI tool to clone a repository and rename it, replacing all instances of the original name with your new project name.

## Installation

You can run this tool directly using npx:

```bash
npx make-mine <repository-url> <new-project-name>
```

Or install it globally:

```bash
npm install -g make-mine
make-mine <repository-url> <new-project-name>
```

## Usage

```bash
make-mine https://github.com/user/template-repo.git my-new-project
```

This will:
1. Clone the repository into a new directory named `my-new-project`
2. Remove the git history
3. Initialize a new git repository
4. Replace all instances of the template name with `my-new-project` in the project files

You can also clone into the current directory using `.` as the project name:
```bash
mkdir my-app && cd my-app
make-mine https://github.com/user/template-repo.git .
```

## License

ISC License (ISC)

Copyright (c) 2024

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE. 