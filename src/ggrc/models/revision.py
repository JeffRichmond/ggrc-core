# Copyright (C) 2013 Google Inc., authors, and contributors <see AUTHORS file>
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
# Created By: vraj@reciprocitylabs.com
# Maintained By: vraj@reciprocitylabs.com

from ggrc import db
from .mixins import Base
from .types import JsonType
from .computed_property import computed_property

class Revision(Base, db.Model):
  __tablename__ = 'revisions'

  resource_id = db.Column(db.Integer, nullable = False)
  resource_type = db.Column(db.String, nullable = False)
  event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable = False)
  action = db.Column(db.Enum(u'created', u'modified', u'deleted'), nullable = False)
  content = db.Column(JsonType, nullable=False)

  _publish_attrs = [
      'resource_id',
      'resource_type',
      'action',
      'content',
      'description',
  ]
  
  @classmethod
  def eager_query(cls):
    from sqlalchemy import orm

    query = super(Revision, cls).eager_query()
    return query.options(
        orm.subqueryload('modified_by'),
        )

  def __init__(self, obj, modified_by_id, action, content):
    self.resource_id = obj.id
    self.modified_by_id = modified_by_id
    self.resource_type = str(obj.__class__.__name__)
    self.action = action
    self.content = content

  @computed_property
  def description(self):
    link_objects = ['ObjectDocument']
    # TODO: Remove check below if migration can guarantee display_name in content
    if 'display_name' not in self.content:
      return ''
    display_name = self.content['display_name']
    if '<->' in display_name:
      #TODO: Fix too many values to unpack below
      source, destination = display_name.split('<->')[:2]
      if self.resource_type in link_objects:
        if self.action == 'created':
          result = "{1} linked to {0}".format(source, destination)
        elif self.action == 'deleted':
          result = "{1} unlinked from {0}".format(source, destination)
        else:
          result = "{0} {1}".format(display_name, self.action)
      else:
        if self.action == 'created':
          result = "{1} mapped to {0}".format(source, destination)
        elif self.action == 'deleted':
          result = "{1} unmapped from {0}".format(source, destination)
        else:
          result = "{0} {1}".format(display_name, self.action)
    else:
      result = "{0} {1}".format(display_name, self.action)
    return result
