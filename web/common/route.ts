export const isPathChildOf = (pathname: string, parent: string) => {
  const parentParts = parent.split('/')
  const pathnameParts = pathname.split('/')
  return parentParts.every((part, index) => part === pathnameParts[index])
}
