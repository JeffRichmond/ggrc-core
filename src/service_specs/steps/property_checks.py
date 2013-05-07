from behave import given, then

@given('nothing new')
def nothing_new(context):
  pass

@given(\
  '"{source_resource}" link property "{property_name}" is "{target_resource}"')
def set_link_property(
    context, source_resource, property_name, target_resource):
  source = getattr(context, source_resource)
  target = getattr(context, target_resource)
  set_property(source, property_name, {'id': target.get(u'id')})

@given(\
    '"{target_resource}" is added to links property "{property_name}" of '\
    '"{source_resource}"')
def add_link_to_list(context, target_resource, property_name, source_resource):
  source = getattr(context, source_resource)
  target = getattr(context, target_resource)
  if isinstance(source, Example):
    links = source.value.get(property_name) or []
    links.append({'id': target.get(u'id')})
    source.value[property_name] = links
  else:
    links = getattr(source, property_name, [])
    links.append({'id': target.get(u'id')})
    setattr(source, property_name, links)

def get_property_from(context, property_path, resource):
  obj = getattr(context, resource)
  assert obj is not None, \
      'Expected to find a resource named {} in the context!'.format(resource)
  property_path = property_path.split('.')
  traversed = []
  for p in property_path:
    traversed.append(p)
    obj = obj.get(unicode(p))
    assert obj is not None, \
        'Could not traverse entire property path, stopped at {}.'.format(
            traversed)
  return obj

@then('the "{property_path}" property of the "{resource}" is empty')
def check_empty_property(context, property_path, resource):
  obj = get_property_from(context, property_path, resource)
  assert type(obj) is list and len(obj) == 0

@then('the "{property_path}" property of the "{resource}" is not empty')
def check_not_empty_property(context, property_path, resource):
  obj = get_property_from(context, property_path, resource)
  assert type(obj) is list 
  assert len(obj) > 0

@then('"{target_resource}" is in the links property "{property_name}" of "{source_resource}"')
def check_link_present_in_list(
    context, target_resource, property_name, source_resource):
  source = getattr(context, source_resource)
  target = getattr(context, target_resource)
  links = source.get(unicode(property_name))
  rel_ids = set([o[u'id'] for o in links])
  assert target.get(u'id') in rel_ids, \
      'Expected to find {} in links: {}'.format(
          target.get(u'id'),
          rel_ids)

@then('the "{parent_property}" of "{child_resource}" is a link to "{parent_resource}"')
def check_link_to_parent(
    context, parent_property, child_resource, parent_resource):
  child = getattr(context, child_resource)
  parent = getattr(context, parent_resource)
  link = child.get(unicode(parent_property))
  assert link is not None, \
      'no {} property was found in {}'.format(parent_property, child_resource)
  assert parent.get(u'id') == link.get(u'id'), \
      'Expected to find link to parent, id={}, instead found {}'.format(
          parent.get(u'id'), link)