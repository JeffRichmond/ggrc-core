# Copyright (C) 2013 Google Inc., authors, and contributors <see AUTHORS file>
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
# Created By: vraj@reciprocitylabs.com
# Maintained By: vraj@reciprocitylabs.com

import re
from sqlalchemy.exc import IntegrityError

def translate_message(exception):
  """
  Translates db exceptions to something a user can understand.
  """
  message = exception.message
  print exception
  print dir(exception)
  print type(exception)
  print exception.message
  print exception.orig
  if isinstance(exception, IntegrityError):
    print "INSIDE"
    # TODO: Handle not null, foreign key errors, uniqueness errors with compound keys
    duplicate_entry_pattern = re.compile(r'\(1062, "(Duplicate entry \'[^\']*\')')
    matches = duplicate_entry_pattern.search(message)
    if matches:
      print "Yup", matches
      return matches.group(1)
    else:
      return message
  else:
    return message

class ValidationError(Exception):
  pass
