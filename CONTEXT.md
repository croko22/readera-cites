# Domain Context

## Glossary

### ReadEra vocabulary Module

The ReadEra vocabulary Module owns only the domain meaning of raw ReadEra backup fields such as `doc_*` and `note_*`. It defines field fallback behavior, progress parsing, title and author selection rules, citation mark meaning, and timestamp interpretation so feature code can depend on named domain concepts instead of backup-field details. Export formatting stays outside this Module and uses the vocabulary it provides.
