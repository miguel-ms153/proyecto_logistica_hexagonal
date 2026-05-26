const bcrypt =
require('bcryptjs');

const hash =
'$2b$10$4glFI83PSCBOXESX2lVVgu4aHk9f9HRcotLR4rpuEnf2lTaKL/m86';

bcrypt.compare(
  '123456',
  hash
).then((result) => {

  console.log(result);

});