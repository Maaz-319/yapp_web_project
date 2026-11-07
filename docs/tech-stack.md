# Tech stack

| Part | Technology | Use in Yapp |
|---|---|---|
| Web server | Apache | Serves files from `public/` and rewrites clean API URLs. |
| Server code | PHP 8+ | Handles API requests, sessions, access checks, and database operations. |
| Database access | PDO with PDO MySQL | Connects PHP to MySQL and runs prepared statements. |
| Database | MySQL 8 compatible | Stores accounts, posts, follows, likes, and remember tokens. |
| Browser pages | HTML | Provides the page structure and forms. |
| Styling | CSS | Styles the interface without a CSS framework. |
| Browser behavior | Vanilla JavaScript | Calls the API with `fetch()` and updates page content. |

The local environment inspected for this guide has PHP 8.3 and MySQL 8.0. The source needs PHP 8 or newer, PDO MySQL, and mbstring. There is no PHP framework, JavaScript framework, or package manager in the application.
